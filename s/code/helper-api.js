let API = "https://api.yaninizdayiz.dijitalusta.net/";
let ERROR_MESSAGE_DEFAULT = "İşlem başarısız oldu, lütfen tekrar deneyiniz.";
let LOADING_MESSAGE = "Başvurunuz gönderiliyor...";

// JS Challenge token generation - proves JavaScript is executing
function generateChallengeToken() {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = Math.random().toString(36).substring(2, 15);
    const payload = `${timestamp}:${random}`;
    return btoa(payload);
}

const API_CONFIG = {
    TIMEOUT: 30000,
    MAX_RETRIES: 2,
    RETRY_BASE_DELAY: 1000
};

function getApiError(result, fallback = ERROR_MESSAGE_DEFAULT) {
    if (result?.errors?.length) {
        return result.errors.join("\n");
    }
    if (result?.message) {
        return result.message;
    }
    return fallback;
}

function isRetryableStatus(status) {
    return status >= 500
        || status === 408
        || status === 429;
}

function isRetryableError(error) {
    return error.name === 'AbortError'
        || error.name === 'TypeError'
        || error.message.includes('fetch')
        || error.message.includes('network');
}

function getRetryDelay(retries, baseDelay = API_CONFIG.RETRY_BASE_DELAY) {
    return baseDelay * Math.pow(2, retries);
}

async function performRetry(callName, data, retries, timeout, maxRetries) {
    let delay = getRetryDelay(retries);
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log(`Retrying ${callName} (${retries + 1}/${maxRetries})`);
    return api(callName, data, retries + 1, timeout);
}

async function api(callName, data = {}, retries = 0, timeout = API_CONFIG.TIMEOUT) {
    let url = `${API}${callName}`;
    let maxRetries = API_CONFIG.MAX_RETRIES;

    try {
        let controller = new AbortController();
        let timeoutId = setTimeout(() => controller.abort(), timeout);

        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Challenge-Token": generateChallengeToken()
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (isRetryableStatus(response.status)) {
            console.error("API call failed:", callName, "Status:", response.status);

            if (retries < maxRetries) {
                return performRetry(callName, data, retries, timeout, maxRetries);
            }

            return {
                error: true,
                status: response.status,
                message: "Sunucu hatası, lütfen daha sonra tekrar deneyiniz."
            };
        }

        if (!response.ok) {
            let text = await response.text();
            console.error(`HTTP ${response.status} from ${url}: ${text}`);
            return { error: true, status: response.status, message: text };
        }

        let result = await response.json();
        console.debug("API response:", callName, result);

        return result;

    } catch (error) {
        console.error("API call failed:", callName, error);

        if (retries < maxRetries
            && isRetryableError(error)) {
            if (error.name === 'AbortError') {
                console.error("Request timeout for:", callName);
            }

            return performRetry(callName, data, retries, timeout, maxRetries);
        }

        return {
            error: true,
            message: "Bağlantı hatası, internet bağlantınızı kontrol ediniz.",
            isNetworkError: true
        };
    }
}

async function apiBtn(btn, endpoint, data, successMsg, errorMsg, redirectUrl, $msgElement) {
    if (btn.dataset.processing === 'true') {
        return;
    }

    btn.dataset.processing = 'true';
    btn.disabled = true;

    let $msg = $msgElement;
    if (!$msg) {
        $msg = btn.nextElementSibling;
        if (!$msg
            || $msg.tagName !== "P") {
            $msg = document.createElement("p");
            $msg.className = "form-message";
            btn.after($msg);
        }
    }

    $msg.textContent = LOADING_MESSAGE;
    $msg.className = "form-message loading";

    let result = await api(endpoint, data);

    if (!result
        || result.error
        || !result.isSuccess) {
        let errText = errorMsg || ERROR_MESSAGE_DEFAULT;
        if (result
            && Array.isArray(result.errors)
            && result.errors.length) {
            errText = result.errors.map(e => `• ${e}`).join("\n");
        }
        $msg.textContent = errText;
        $msg.className = "form-message error";
    } else {
        $msg.textContent = successMsg;
        $msg.className = "form-message success";

        if (result.data
            && result.data.redirectUrl) {
            redirectUrl = result.data.redirectUrl;
        }

        if (redirectUrl) {
            setTimeout(() => {
                location.href = redirectUrl;
            }, 2000);
        }
    }

    btn.disabled = false;
    btn.dataset.processing = 'false';
    return result;
}

function sanitizeHtml(str) {
    if (!str
        || typeof str !== 'string') {
        return '';
    }
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, c => map[c]);
}

function logErr(result) {
    let errText = "Bir hata oluştu.";
    if (result
        && Array.isArray(result.errors)
        && result.errors.length) {
        errText = result.errors.join(", ");
    }
    console.error(errText);
}
