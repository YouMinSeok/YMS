document.getElementById('sendFriendRequestBtn').addEventListener('click', function() {
    const shortId = document.getElementById('shortIdInput').value;

    fetch('/api/friends/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shortId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Error:', error));
});

document.querySelectorAll('.accept-btn').forEach(button => {
    button.addEventListener('click', function() {
        const requestId = this.dataset.requestId;

        fetch('/api/friends/accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requestId })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(error => console.error('Error:', error));
    });
});

document.querySelectorAll('.decline-btn').forEach(button => {
    button.addEventListener('click', function() {
        const requestId = this.dataset.requestId;

        fetch('/api/friends/decline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requestId })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(error => console.error('Error:', error));
    });
});
