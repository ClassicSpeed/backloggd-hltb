chrome.runtime.onMessage.addListener(
    function (url, sender, onSuccess) {
        fetch(url, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json()).then(value => onSuccess(value));

        return true;
    }
);