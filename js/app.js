 const { createApp, ref, onMounted, computed } = Vue;

      createApp({
        setup() {
          // Состояния экранов
          const currentScreen = ref("splash");
          const currentAuthForm = ref("signup");
          const currentPage = ref("home");
          const backgroundPosition = ref("30% center");
          const flippedNFTs = ref({});

          // Данные авторизации
          const signupPhone = ref("");
          const signupPassword = ref("");
          const loginPhone = ref("");
          const loginPassword = ref("");

          // Данные пользователя
          const currentUser = ref({
            id: null,
            name: "Anonymous",
            phone: "",
            avatar: "img/default-avatar.png",
            location: "",
            bio: "",
          });

          // Данные для создания NFT
          const ownershipType = ref("own");
          const nftName = ref("");
          const nftDescription = ref("");
          const nftTags = ref("");
          const nftExternalLink = ref("");
          const attributesCount = ref(0);
          const traits = ref([]);
          const nftImagePreview = ref("");
          const nftImageFile = ref(null);
          const qrCodeGenerated = ref(false);

          // Посты и NFT
          const posts = ref([]);
          const userNFTs = ref([]);
          const alerts = ref([]);
          const searchQuery = ref("");
          const newComment = ref("");

          // Security
          const currentPassword = ref("");
          const newPassword = ref("");
          const confirmNewPassword = ref("");
          const twoFactorEnabled = ref(false);

          // Wallet Settings
          const walletCreated = ref(false);
          const walletEmail = ref("");
          const walletPassword = ref("");
          const confirmWalletPassword = ref("");
          const recoveryPhrase = ref("");
          const walletAddress = ref("");
          const showPhrase = ref(false);

          // Инициализация данных в LocalStorage
          const initLocalStorage = () => {
            if (!localStorage.getItem("users")) {
              localStorage.setItem("users", JSON.stringify([]));
            }
            if (!localStorage.getItem("posts")) {
              const demoPosts = [
                {
                  id: 1,
                  userId: 1,
                  userName: "Olera Sydorenko",
                  userAvatar: "img/056026b6db13070cbe45543d3d1ef857.png",
                  nftImage: "img/4b66197f9eb7e0792df1f70079064ea2dc357fc6.jpg",
                  title: "Sound Legacy-NFT",
                  description:
                    "Sound Legacy - A melody that will belong only to you, forever protected by blockchain.",
                  tags: ["MusicNFT", "Blockchain", "DigitalOwnership"],
                  likes: 124,
                  liked: false,
                  comments: [],
                  showComments: false,
                  createdAt: new Date().toISOString(),
                },
                {
                  id: 2,
                  userId: 2,
                  userName: "Bohdan Shevchenko",
                  userAvatar:
                    "img/9a7f219211dd83fedb08d30580f72b891e9efc04.jpg",
                  nftImage: "img/056026b6db13070cbe45543d3d1ef857.png",
                  title: "Symbolic of Strength",
                  description:
                    "This NFT represents the strength and resilience of the human spirit in digital form.",
                  tags: ["ArtNFT", "Symbolism", "Strength"],
                  likes: 89,
                  liked: false,
                  comments: [],
                  showComments: false,
                  createdAt: new Date(
                    Date.now() - 3 * 60 * 60 * 1000
                  ).toISOString(),
                },
              ];
              localStorage.setItem("posts", JSON.stringify(demoPosts));
            }
            if (!localStorage.getItem("alerts")) {
              localStorage.setItem("alerts", JSON.stringify([]));
            }
            if (!localStorage.getItem("wallet")) {
              localStorage.setItem("wallet", JSON.stringify([]));
            }
          };

          // Загрузка данных из LocalStorage
          const loadData = () => {
            posts.value = JSON.parse(localStorage.getItem("posts")) || [];
            alerts.value = JSON.parse(localStorage.getItem("alerts")) || [];
            userNFTs.value = JSON.parse(localStorage.getItem("wallet")) || [];

            // Загружаем текущего пользователя, если он авторизован
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const loggedInUserId = localStorage.getItem("loggedInUserId");
            if (loggedInUserId) {
              const user = users.find((u) => u.id == loggedInUserId);
              if (user) {
                currentUser.value = user;
              }
            }
          };

          // Сохранение данных в LocalStorage
          const saveData = (key, data) => {
            localStorage.setItem(key, JSON.stringify(data));
          };

          // Фильтрация постов по поисковому запросу
          const filteredPosts = computed(() => {
            if (!searchQuery.value) return posts.value;
            const query = searchQuery.value.toLowerCase();
            return posts.value.filter(
              (post) =>
                post.title.toLowerCase().includes(query) ||
                post.description.toLowerCase().includes(query) ||
                (post.tags &&
                  post.tags.some((tag) => tag.toLowerCase().includes(query)))
            );
          });

          // Обработка авторизации
          const handleAuth = (type) => {
            if (type === "signup") {
              // Регистрация нового пользователя
              const users = JSON.parse(localStorage.getItem("users")) || [];
              const newUser = {
                id: Date.now(),
                name: `User${users.length + 1}`,
                phone: signupPhone.value,
                password: signupPassword.value,
                avatar: "img/default-avatar.png",
                createdAt: new Date().toISOString(),
              };
              users.push(newUser);
              saveData("users", users);

              // Авторизуем нового пользователя
              localStorage.setItem("loggedInUserId", newUser.id);
              currentUser.value = newUser;
              currentScreen.value = "app";

              // Добавляем уведомление
              addAlert(
                "Welcome!",
                `Welcome to MARKIdentity, ${newUser.name}! Start by creating your first NFT.`
              );
            } else {
              // Вход существующего пользователя
              const users = JSON.parse(localStorage.getItem("users")) || [];
              const user = users.find(
                (u) =>
                  u.phone === loginPhone.value &&
                  u.password === loginPassword.value
              );

              if (user) {
                localStorage.setItem("loggedInUserId", user.id);
                currentUser.value = user;
                currentScreen.value = "app";

                // Добавляем уведомление
                addAlert("Welcome back!", `Welcome back, ${user.name}!`);
              } else {
                alert("Invalid phone number or password");
              }
            }
          };

          // Выход из системы
          const logout = () => {
            localStorage.removeItem("loggedInUserId");
            currentUser.value = {
              id: null,
              name: "Anonymous",
              phone: "",
              avatar: "img/default-avatar.png",
            };
            currentScreen.value = "auth";
            currentAuthForm.value = "login";
          };

          // Редактирование профиля
          const editProfile = () => {
            const newName = prompt("Enter your name:", currentUser.value.name);
            if (newName !== null) {
              const newBio = prompt(
                "Enter your bio:",
                currentUser.value.bio || ""
              );
              const newLocation = prompt(
                "Enter your location:",
                currentUser.value.location || ""
              );

              currentUser.value.name = newName;
              currentUser.value.bio = newBio;
              currentUser.value.location = newLocation;

              // Обновляем в LocalStorage
              const users = JSON.parse(localStorage.getItem("users")) || [];
              const userIndex = users.findIndex(
                (u) => u.id === currentUser.value.id
              );
              if (userIndex !== -1) {
                users[userIndex] = currentUser.value;
                saveData("users", users);
              }

              addAlert(
                "Profile updated",
                "Your profile information has been updated successfully."
              );
            }
          };

          // Добавление лайка к посту
          const toggleLike = (postId) => {
            const postIndex = posts.value.findIndex((p) => p.id === postId);
            if (postIndex !== -1) {
              const post = posts.value[postIndex];
              post.liked = !post.liked;
              post.likes += post.liked ? 1 : -1;

              // Сохраняем изменения
              saveData("posts", posts.value);

              // Добавляем уведомление
              if (post.liked) {
                addAlert(
                  "New like",
                  `You liked ${post.userName}'s post "${post.title}"`
                );
              }
            }
          };

          // Переключение отображения комментариев
          const toggleComments = (postId) => {
            const postIndex = posts.value.findIndex((p) => p.id === postId);
            if (postIndex !== -1) {
              posts.value[postIndex].showComments =
                !posts.value[postIndex].showComments;
            }
          };

          // Добавление комментария
          const addComment = (postId) => {
            if (!newComment.value.trim()) return;

            const postIndex = posts.value.findIndex((p) => p.id === postId);
            if (postIndex !== -1) {
              const comment = {
                id: Date.now(),
                userId: currentUser.value.id,
                userName: currentUser.value.name,
                userAvatar: currentUser.value.avatar,
                text: newComment.value,
                createdAt: new Date().toISOString(),
              };

              posts.value[postIndex].comments.push(comment);
              newComment.value = "";

              // Сохраняем изменения
              saveData("posts", posts.value);

              // Добавляем уведомление
              if (posts.value[postIndex].userId !== currentUser.value.id) {
                addAlert(
                  "New comment",
                  `${currentUser.value.name} commented on your post: "${comment.text}"`
                );
              }
            }
          };

          // Покупка NFT
          const buyNFT = (post) => {
            // Создаем NFT для кошелька пользователя
            const newNFT = {
              id: Date.now(),
              title: post.title,
              image: post.nftImage,
              description: post.description,
              originalPostId: post.id,
              ownerId: currentUser.value.id,
              createdAt: new Date().toISOString(),
            };

            userNFTs.value.push(newNFT);
            saveData("wallet", userNFTs.value);
            flippedNFTs.value[newNFT.id] = false;

            // Добавляем уведомление
            addAlert(
              "NFT Purchased",
              `You have successfully purchased "${post.title}" NFT. It's now in your wallet.`
            );

            // Показываем сообщение об успешной покупке
            alert(`You have successfully purchased "${post.title}" NFT!`);

            // Генерируем QR-код
            generateNFTQRCode(newNFT.id);
          };

          // Показать детали NFT
          const showNFTDetails = (nft) => {
            alert(
              `NFT Details:\nTitle: ${nft.title}\nDescription: ${
                nft.description
              }\nOwned since: ${formatTime(nft.createdAt)}`
            );
          };

          // Добавление уведомления
          const addAlert = (title, text) => {
            const newAlert = {
              id: Date.now(),
              title,
              text,
              createdAt: new Date().toISOString(),
              read: false,
            };

            alerts.value.unshift(newAlert);
            saveData("alerts", alerts.value);
          };

          // Форматирование времени
          const formatTime = (timestamp) => {
            const now = new Date();
            const date = new Date(timestamp);
            const diff = now - date;

            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
            if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
            if (minutes > 0)
              return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
            return "just now";
          };

          // NFT Creation Functions
          const triggerFileInput = (type) => {
            document.getElementById(`${type}-upload`).click();
          };

          const handleNftUpload = (event) => {
            const file = event.target.files[0];
            if (file) {
              nftImageFile.value = file;
              nftImagePreview.value = URL.createObjectURL(file);
            }
          };

          const increaseAttributes = () => {
            attributesCount.value++;
          };

          const decreaseAttributes = () => {
            if (attributesCount.value > 0) {
              attributesCount.value--;
            }
          };

          const addTrait = () => {
            traits.value.push({
              trait_type: "",
              value: "",
            });
          };

          // Переключение состояния переворота NFT
          const toggleFlip = (nftId) => {
            flippedNFTs.value[nftId] = !flippedNFTs.value[nftId];

            if (flippedNFTs.value[nftId]) {
              generateNFTQRCode(nftId);
            }
          };

          // Генерация QR-кода для NFT
          const generateNFTQRCode = (nftId) => {
            const nft = userNFTs.value.find((n) => n.id === nftId);
            if (nft) {
              setTimeout(() => {
                const qrContainer = document.getElementById(`qrcode-${nftId}`);
                if (qrContainer) {
                  qrContainer.innerHTML = "";
                  new QRCode(qrContainer, {
                    text: `NFT ID: ${nftId}\nName: ${nft.title}\nOwner: ${
                      currentUser.value.name
                    }\nCreated: ${new Date(
                      nft.createdAt
                    ).toLocaleDateString()}`,
                    width: 120,
                    height: 120,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H,
                  });
                }
              }, 100);
            }
          };

          // Создание NFT
          const createNFT = () => {
            if (!nftName.value || !nftDescription.value) {
              alert("Please fill in all required fields");
              return;
            }

            // Создаем новый пост с NFT
            const newPost = {
              id: Date.now(),
              userId: currentUser.value.id,
              userName: currentUser.value.name,
              userAvatar: currentUser.value.avatar,
              nftImage: nftImagePreview.value || "img/default-nft.png",
              title: nftName.value,
              description: nftDescription.value,
              tags: nftTags.value
                ? nftTags.value.split(",").map((tag) => tag.trim())
                : [],
              likes: 0,
              liked: false,
              comments: [],
              showComments: false,
              createdAt: new Date().toISOString(),
            };

            posts.value.unshift(newPost);
            saveData("posts", posts.value);

            // Добавляем NFT в кошелек пользователя
            const newNFT = {
              id: newPost.id,
              title: nftName.value,
              image: nftImagePreview.value || "img/default-nft.png",
              description: nftDescription.value,
              originalPostId: newPost.id,
              ownerId: currentUser.value.id,
              createdAt: new Date().toISOString(),
            };

            userNFTs.value.unshift(newNFT);
            saveData("wallet", userNFTs.value);
            flippedNFTs.value[newNFT.id] = false;

            // Добавляем уведомление
            addAlert(
              "NFT Created",
              `You have successfully created "${nftName.value}" NFT. It's now in your wallet.`
            );

            // Генерируем QR-код
            generateNFTQRCode(newNFT.id);

            // Показываем сообщение об успешном создании
            alert(`You have successfully created "${nftName.value}" NFT!`);

            // Сбрасываем форму
            resetNFTForm();

            // Переходим на главную страницу
            currentPage.value = "home";
          };

          // Сброс формы NFT
          const resetNFTForm = () => {
            nftName.value = "";
            nftDescription.value = "";
            nftTags.value = "";
            nftExternalLink.value = "";
            attributesCount.value = 0;
            traits.value = [];
            nftImagePreview.value = "";
            nftImageFile.value = null;
            document.getElementById("nft-upload").value = "";
          };

          // ⚙️ Security: смена пароля
          const changePassword = () => {
            if (newPassword.value !== confirmNewPassword.value) {
              alert("New passwords don't match");
              return;
            }

            const users = JSON.parse(localStorage.getItem("users")) || [];
            const userIndex = users.findIndex(
              (u) => u.id === currentUser.value.id
            );

            if (userIndex !== -1) {
              if (users[userIndex].password !== currentPassword.value) {
                alert("Current password is incorrect");
                return;
              }

              users[userIndex].password = newPassword.value;
              localStorage.setItem("users", JSON.stringify(users));
              currentUser.value.password = newPassword.value;

              alert("Password changed successfully");
              currentPassword.value = "";
              newPassword.value = "";
              confirmNewPassword.value = "";

              addAlert(
                "Password Changed",
                "Your account password has been updated successfully."
              );
            }
          };

          // ⚙️ Wallet: создание
          const createWallet = () => {
            if (walletPassword.value !== confirmWalletPassword.value) {
              alert("Passwords don't match");
              return;
            }

            if (!walletEmail.value) {
              alert("Please enter your email");
              return;
            }

            const phrases = [
              "apple",
              "banana",
              "cherry",
              "date",
              "elderberry",
              "fig",
              "grape",
              "honeydew",
              "kiwi",
              "lemon",
              "mango",
              "nectarine",
            ];
            recoveryPhrase.value = phrases
              .sort(() => 0.5 - Math.random())
              .slice(0, 12)
              .join(" ");

            walletAddress.value =
              "0x" +
              Array.from({ length: 40 }, () =>
                Math.floor(Math.random() * 16).toString(16)
              ).join("");

            walletCreated.value = true;

            const users = JSON.parse(localStorage.getItem("users")) || [];
            const userIndex = users.findIndex(
              (u) => u.id === currentUser.value.id
            );

            if (userIndex !== -1) {
              users[userIndex].wallet = {
                email: walletEmail.value,
                password: walletPassword.value,
                recoveryPhrase: recoveryPhrase.value,
                address: walletAddress.value,
                createdAt: new Date().toISOString(),
              };

              localStorage.setItem("users", JSON.stringify(users));
              currentUser.value.wallet = users[userIndex].wallet;
            }

            addAlert(
              "Wallet Created",
              "Your NFT wallet has been created successfully."
            );
          };

          const copyRecoveryPhrase = () => {
            navigator.clipboard.writeText(recoveryPhrase.value);
            alert("Recovery phrase copied to clipboard");
          };

          const copyWalletAddress = () => {
            navigator.clipboard.writeText(walletAddress.value);
            alert("Wallet address copied to clipboard");
          };

          const showRecoveryPhrase = () => {
            alert(
              `Your recovery phrase is:\n\n${currentUser.value.wallet.recoveryPhrase}\n\nKeep it safe!`
            );
          };

          const changeWalletPassword = () => {
            const newPass = prompt("Enter new wallet password:");
            if (newPass) {
              const confirmPass = prompt("Confirm new wallet password:");

              if (newPass === confirmPass) {
                const users = JSON.parse(localStorage.getItem("users")) || [];
                const userIndex = users.findIndex(
                  (u) => u.id === currentUser.value.id
                );

                if (userIndex !== -1 && users[userIndex].wallet) {
                  users[userIndex].wallet.password = newPass;
                  localStorage.setItem("users", JSON.stringify(users));
                  currentUser.value.wallet.password = newPass;
                  alert("Wallet password changed successfully");
                }
              } else {
                alert("Passwords don't match");
              }
            }
          };

          const resetWallet = () => {
            if (
              confirm(
                "Are you sure you want to reset your wallet? This will delete all your NFTs and wallet data."
              )
            ) {
              const users = JSON.parse(localStorage.getItem("users")) || [];
              const userIndex = users.findIndex(
                (u) => u.id === currentUser.value.id
              );

              if (userIndex !== -1) {
                delete users[userIndex].wallet;
                localStorage.setItem("users", JSON.stringify(users));

                let walletNFTs =
                  JSON.parse(localStorage.getItem("wallet")) || [];
                walletNFTs = walletNFTs.filter(
                  (nft) => nft.ownerId !== currentUser.value.id
                );
                localStorage.setItem("wallet", JSON.stringify(walletNFTs));

                currentUser.value.wallet = null;
                walletCreated.value = false;
                walletEmail.value = "";
                walletPassword.value = "";
                confirmWalletPassword.value = "";
                recoveryPhrase.value = "";
                walletAddress.value = "";

                addAlert(
                  "Wallet Reset",
                  "Your wallet has been reset successfully."
                );
              }
            }
          }; // ✅ ЗАКРЫЛИ resetWallet

          // Инициализация приложения
          onMounted(() => {
            initLocalStorage();
            loadData();

            if (currentUser.value.wallet) {
              walletCreated.value = true;
              walletEmail.value = currentUser.value.wallet.email;
              walletAddress.value = currentUser.value.wallet.address;
            }

            // Проверяем, авторизован ли пользователь
            const loggedInUserId = localStorage.getItem("loggedInUserId");
            if (loggedInUserId) {
              currentScreen.value = "app";
            }

            // Анимация фона при переходе на welcome screen
            setTimeout(() => {
              if (currentScreen.value === "splash") {
                currentScreen.value = "welcome";
                backgroundPosition.value = "70% center";
              }
            }, 2000);

            // Генерируем QR-коды для NFT в кошельке
            setTimeout(() => {
              userNFTs.value.forEach((nft) => {
                flippedNFTs.value[nft.id] = false;
                generateNFTQRCode(nft.id);
              });
            }, 500);
          });

          return {
            currentScreen,
            currentAuthForm,
            currentPage,
            backgroundPosition,
            signupPhone,
            signupPassword,
            loginPhone,
            loginPassword,
            currentUser,
            ownershipType,
            nftName,
            nftDescription,
            nftTags,
            nftExternalLink,
            attributesCount,
            traits,
            nftImagePreview,
            qrCodeGenerated,
            posts,
            userNFTs,
            alerts,
            searchQuery,
            newComment,
            flippedNFTs,
            filteredPosts,
            handleAuth,
            logout,
            editProfile,
            toggleLike,
            toggleComments,
            addComment,
            buyNFT,
            showNFTDetails,
            formatTime,
            triggerFileInput,
            handleNftUpload,
            increaseAttributes,
            decreaseAttributes,
            addTrait,
            createNFT,
            toggleFlip,
            // Security
            currentPassword,
            newPassword,
            confirmNewPassword,
            twoFactorEnabled,
            changePassword,

            // Wallet Settings
            walletCreated,
            walletEmail,
            walletPassword,
            confirmWalletPassword,
            recoveryPhrase,
            walletAddress,
            showPhrase,
            createWallet,
            copyRecoveryPhrase,
            copyWalletAddress,
            showRecoveryPhrase,
            changeWalletPassword,
            resetWallet,
          };
        },
      }).mount("#app");