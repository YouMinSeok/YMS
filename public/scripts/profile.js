document.addEventListener("DOMContentLoaded", function() {
    var tabButtons = document.querySelectorAll(".tab-btn");
    var tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            tabButtons.forEach(function(btn) {
                btn.classList.remove("active");
            });
            tabContents.forEach(function(content) {
                content.classList.remove("active");
            });

            button.classList.add("active");
            var tabId = button.getAttribute("onclick").split("'")[1];
            document.getElementById(tabId).classList.add("active");
        });
    });

    // Avatar change
    document.getElementById("avatarInput").addEventListener("change", function(event) {
        var reader = new FileReader();
        reader.onload = function() {
            var avatarImage = document.getElementById("avatarImage");
            avatarImage.src = reader.result;
        };
        reader.readAsDataURL(event.target.files[0]);
    });

    // 초기 상태 설정
    const nicknameInput = document.getElementById('nicknameInput');
    const nicknameDisplay = document.getElementById('nicknameDisplay');
    nicknameInput.value = nicknameDisplay.textContent;
});

function showNicknameInput() {
    const nicknameDisplay = document.getElementById('nicknameDisplay');
    const nicknameInput = document.getElementById('nicknameInput');
    const nicknameInputGroup = document.getElementById('nicknameInputGroup');

    // 기존 닉네임 텍스트 숨기기
    nicknameDisplay.style.display = 'none';

    // 닉네임 입력 필드 보이기
    nicknameInputGroup.style.display = 'flex';
    nicknameInput.value = nicknameDisplay.textContent;

    // 닉네임 변경 버튼 숨기기
    document.querySelector('.change-nickname-btn').style.display = 'none';
    
    // 중복 확인 버튼 보이기
    document.querySelector('.check-nickname-btn').style.display = 'inline-block';
}


async function checkNickname() {
    const newNickname = document.getElementById('nicknameInput').value;
    const currentNickname = document.getElementById('nicknameDisplay').textContent;

    try {
        const response = await fetch('/check-nickname', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nickname: newNickname, currentNickname: currentNickname })
        });

        const data = await response.json();
        const message = document.getElementById('nicknameMessage');
        message.style.display = 'inline-block';

        if (response.ok) {
            alert('사용 가능한 닉네임입니다.');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error checking nickname:', error);
        alert('닉네임 중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

async function saveProfile() {
    const formData = new FormData();
    const avatarFile = document.getElementById('avatarInput').files[0];
    const userId = document.getElementById('userId').value;
    const newNickname = document.getElementById('nicknameInput').value;

    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }

    formData.append('userId', userId);
    formData.append('nickname', newNickname);

    try {
        const response = await fetch('/update', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('nicknameDisplay').textContent = data.nickname;
            document.getElementById('nicknameInput').value = data.nickname;
            document.getElementById('navbarNickname').textContent = data.nickname;
            document.getElementById('welcomeMessage').textContent = `${data.nickname}님, 환영합니다!`;
            if (data.avatar) {
                document.getElementById('avatarImage').src = data.avatar;
                const navbarAvatar = document.querySelector('.navbar-avatar');
                if (navbarAvatar) {
                    navbarAvatar.src = data.avatar;
                }
            }
            sessionStorage.setItem('nickname', data.nickname);
            sessionStorage.setItem('avatar', data.avatar);

            // 닉네임 필드 숨기고 텍스트로 다시 표시
            document.getElementById('nicknameInputGroup').style.display = 'none';
            document.getElementById('nicknameDisplay').style.display = 'inline';
            document.querySelector('.change-nickname-btn').style.display = 'inline-block';
            document.querySelector('.check-nickname-btn').style.display = 'none';

            alert('프로필이 성공적으로 저장되었습니다.');
            window.location.href = '/';  // 메인 페이지로 리다이렉트
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('프로필 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

function openTab(evt, tabName) {
    var i, tabcontent, tabbtn;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tabbtn = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tabbtn.length; i++) {
        tabbtn[i].className = tabbtn[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Default open tab
document.getElementById("basic-info").style.display = "block";
document.querySelector(".tab-btn").classList.add("active");
