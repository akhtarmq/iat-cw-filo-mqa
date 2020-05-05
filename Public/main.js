// main.js
const update = document.querySelector('#update-button')
const cancelButton = document.querySelector('#cancel-button')
const messageDiv = document.querySelector('#message')
const requestButton = document.querySelector('#request-button')

requestButton.addEventListener('click', _ => {
    var reason = prompt("Enter reason for request:", "");
    var itemid = requestButton.getAttribute("data-itemid");

    if (reason) {
        fetch('/request', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemid: itemid,
                reason: reason
            })
        })
            .then(res => {
                if (res.ok) return res.json()
            })
            .then(response => {
                if (response === 'No quote to delete') {
                    messageDiv.textContent = 'No Darth Vadar quote to delete'
                } else {
                    window.location.reload(true)
                }
            })
            .catch(console.error)
    }
})

update.addEventListener('click', _ => {
    fetch('/requests', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Darth Vadar',
            quote: 'I find your lack of faith disturbing.'
        })
    })
        .then(res => {
            if (res.ok) return res.json()
        })
        .then(response => {
            window.location.reload(true)
        })
})

cancelButton.addEventListener('click', _ => {
    fetch('/cancelrequest', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Darth Vadar'
        })
    })
        .then(res => {
            if (res.ok) return res.json()
        })
        .then(response => {
            if (response === 'No quote to delete') {
                messageDiv.textContent = 'No Darth Vadar quote to delete'
            } else {
                window.location.reload(true)
            }
        })
        .catch(console.error)
})

