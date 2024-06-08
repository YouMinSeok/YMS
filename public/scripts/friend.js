document.addEventListener("DOMContentLoaded", function() {
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
            location.reload(); // 요청 후 페이지 새로고침
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
});

function openTab(evt, tabName) {
    var i, tabcontent, tabbtn;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tabbtn = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tabbtn.length; i++) {
        tabbtn[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function showFriendDetails(id, nickname, email, avatarUrl) {
    const profileCard = document.getElementById('profileCard');
    profileCard.querySelector('.friend-profile-avatar').src = avatarUrl;
    profileCard.querySelector('.friend-nickname').textContent = nickname;
    profileCard.querySelector('.friend-email').textContent = email;
    profileCard.style.display = 'flex';
    profileCard.setAttribute('data-friend-id', id);
    profileCard.setAttribute('data-friend-nickname', nickname); // 닉네임 저장
    document.getElementById('chatBox').style.display = 'none';
}

function startChat() {
    const profileCard = document.getElementById('profileCard');
    const friendId = profileCard.getAttribute('data-friend-id');
    const friendNickname = profileCard.getAttribute('data-friend-nickname'); // 닉네임 가져오기
    const chatBox = document.getElementById('chatBox');
    chatBox.querySelector('.chat-friend-name').textContent = friendNickname; // 닉네임 설정
    chatBox.style.display = 'flex';
    chatBox.querySelector('.chat-messages').setAttribute('id', `chatMessages-${friendId}`);
    chatBox.querySelector('.chat-input input').setAttribute('id', `chatInput-${friendId}`);
    chatBox.querySelector('.chat-input button').setAttribute('onclick', `sendMessage('${friendId}')`);
    profileCard.style.display = 'none'; // 프로필 카드 숨기기
}

function closeChat() {
    document.getElementById('chatBox').style.display = 'none';
    document.getElementById('profileCard').style.display = 'none';
}

function sendMessage(friendId) {
    const input = document.getElementById(`chatInput-${friendId}`);
    const messages = document.getElementById(`chatMessages-${friendId}`);
    const message = input.value;
    if (message.trim() !== "") {
        const messageElement = document.createElement('div');
        messageElement.className = 'message me';
        messageElement.innerHTML = `
            <div class="message-text">${message}</div>
        `;
        messages.appendChild(messageElement);
        input.value = "";
    }
}
