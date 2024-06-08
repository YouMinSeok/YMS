document.addEventListener("DOMContentLoaded", function() {
    socket = io(); // socket.io 클라이언트 연결

    // 방에 입장
    function joinRoom(roomId) {
        console.log(`Joining room: ${roomId}`);
        socket.emit('join room', roomId);
    }

    document.getElementById('sendFriendRequestBtn').addEventListener('click', function() {
        const shortId = document.getElementById('shortIdInput').value;
        console.log(`Sending friend request to: ${shortId}`);

        fetch('/api/friends/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ shortId })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Friend request response:', data);
            alert(data.message);
            location.reload(); // 요청 후 페이지 새로고침
        })
        .catch(error => console.error('Error:', error));
    });

    document.querySelectorAll('.accept-btn').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = this.dataset.requestId;
            console.log(`Accepting friend request: ${requestId}`);

            fetch('/api/friends/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requestId })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Accept friend request response:', data);
                alert(data.message);
                location.reload();
            })
            .catch(error => console.error('Error:', error));
        });
    });

    document.querySelectorAll('.decline-btn').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = this.dataset.requestId;
            console.log(`Declining friend request: ${requestId}`);

            fetch('/api/friends/decline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requestId })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Decline friend request response:', data);
                alert(data.message);
                location.reload();
            })
            .catch(error => console.error('Error:', error));
        });
    });

    socket.on('chat message', function(msg) {
        console.log(`Message received:`, msg);
        const messages = document.getElementById(`chatMessages-${msg.roomId}`);
        if (messages) {
            const messageElement = document.createElement('div');
            messageElement.className = msg.senderId === socket.id ? 'message me' : 'message friend';
            messageElement.innerHTML = msg.senderId === socket.id ? `<div class="message-text">${msg.text}</div>` : `<div class="message-text"><strong>${msg.senderNickname}:</strong> ${msg.text}</div>`;
            messages.appendChild(messageElement);
            messages.scrollTop = messages.scrollHeight; // 스크롤을 최신 메시지로 이동
        }
    });

    window.startChat = function() {
        const profileCard = document.getElementById('profileCard');
        const friendShortId = profileCard.getAttribute('data-friend-id'); // 친구의 shortId 가져오기
        const userShortId = document.body.getAttribute('data-user-shortid'); // 현재 사용자의 shortId 가져오기
        const userNickname = document.body.getAttribute('data-user-nickname'); // 현재 사용자의 닉네임 가져오기
        console.log(`Starting chat with friendShortId: ${friendShortId}, userShortId: ${userShortId}, userNickname: ${userNickname}`);

        if (!friendShortId || !userShortId) {
            console.error('ShortId missing');
            return;
        }

        // 방 ID를 두 사용자의 shortId를 정렬하여 생성
        const roomId = [friendShortId, userShortId].sort().join('_');
        joinRoom(roomId);

        const chatBox = document.getElementById('chatBox');
        chatBox.querySelector('.chat-friend-name').textContent = profileCard.querySelector('.friend-nickname').textContent; // 닉네임 설정
        chatBox.style.display = 'flex';
        chatBox.querySelector('.chat-messages').setAttribute('id', `chatMessages-${roomId}`);
        chatBox.querySelector('.chat-input input').setAttribute('id', `chatInput-${roomId}`);
        chatBox.querySelector('.chat-input button').setAttribute('onclick', `sendMessage('${roomId}', '${userNickname}')`);
        profileCard.style.display = 'none'; // 프로필 카드 숨기기
    };

    window.sendMessage = function(roomId, userNickname) {
        const input = document.getElementById(`chatInput-${roomId}`);
        const message = input.value;
        if (message.trim() !== "") {
            const messageData = {
                roomId: roomId,
                text: message,
                senderId: socket.id,
                senderNickname: userNickname
            };
            console.log(`Sending message:`, messageData);
            socket.emit('chat message', messageData); // 서버로 메시지 전송
            input.value = "";
        }
    };
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
    profileCard.querySelector('.friend-nickname').dataset.userId = id; // 현재 사용자의 ID 설정
    profileCard.querySelector('.friend-email').textContent = email;
    profileCard.style.display = 'flex';
    profileCard.setAttribute('data-friend-id', id);
    profileCard.setAttribute('data-friend-nickname', nickname); // 닉네임 저장
    document.getElementById('chatBox').style.display = 'none';
}
