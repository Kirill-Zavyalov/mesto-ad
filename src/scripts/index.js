/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/


import { createCardElement, deleteCard, updateLikeStatus } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { 
  getUserInfo, 
  getCardList, 
  setUserInfo, 
  setUserAvatar, 
  addNewCard, 
  deleteCardApi, 
  changeLikeCardStatus 
} from "./components/api.js";

const placesWrap = document.querySelector(".places__list");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const confirmDeleteModal = document.querySelector(".popup_type_remove-card");
const confirmDeleteForm = confirmDeleteModal.querySelector(".popup__form");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

let currentUserID = null;
let cardToDelete = { id: null, element: null };

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = profileForm.querySelector(validationSettings.submitButtonSelector);
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log("Ошибка при обновлении профиля:", err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = avatarForm.querySelector(validationSettings.submitButtonSelector);
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  
  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => {
      console.log("Ошибка при обновлении аватара:", err);
    })
    .finally(() => {
      // Возвращаем исходный текст кнопки
      submitButton.textContent = originalText;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = cardForm.querySelector(validationSettings.submitButtonSelector);
  const originalText = submitButton.textContent;
  submitButton.textContent = "Создание...";
  
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(cardData, {
          onPreviewPicture: handlePreviewPicture,
          onDeleteCard: handleDeleteClick,
          onLikeIcon: handleLikeClick,
        }, currentUserID)
      );
      
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.log("Ошибка при добавлении карточки:", err);
    })
    .finally(() => {
      // Возвращаем исходный текст кнопки
      submitButton.textContent = originalText;
    });
};

const handleDeleteClick = (cardId, cardElement) => {
  cardToDelete = { id: cardId, element: cardElement };
  openModalWindow(confirmDeleteModal);
};

const handleConfirmDelete = (evt) => {
  evt.preventDefault();
  
  const submitButton = confirmDeleteForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Удаление...";
  
  deleteCardApi(cardToDelete.id)
    .then(() => {
      deleteCard(cardToDelete.element);
      closeModalWindow(confirmDeleteModal);
      cardToDelete = { id: null, element: null };
    })
    .catch((err) => {
      console.log("Ошибка при удалении карточки:", err);
    })
    .finally(() => {
      // Возвращаем исходный текст кнопки
      submitButton.textContent = originalText;
    });
};

const handleLikeClick = (cardId, isLiked, cardElement) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      updateLikeStatus(cardElement, updatedCard.likes, currentUserID);
    })
    .catch((err) => {
      console.log("Ошибка при изменении лайка:", err);
    });
};


Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserID = userData._id;
    
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, {
          onPreviewPicture: handlePreviewPicture,
          onDeleteCard: handleDeleteClick,
          onLikeIcon: (cardId, isLiked, cardElement) => handleLikeClick(cardId, isLiked, cardElement),
        }, currentUserID)
      );
    });
  })
  .catch((err) => {
    console.log("Ошибка при загрузке данных:", err);
  });


openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

profileForm.addEventListener("submit", handleProfileFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
confirmDeleteForm.addEventListener("submit", handleConfirmDelete);


const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.querySelector("#popup-info-definition-template").content;
  const infoItem = template.querySelector(".popup__info-item").cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  return infoItem;
};

const createUserPreview = (user) => {
  const template = document.querySelector("#popup-info-user-preview-template").content;
  const userItem = template.querySelector(".popup__list-item").cloneNode(true);
  userItem.style.backgroundImage = `url(${user.avatar})`;
  userItem.title = user.name;
  return userItem;
};

const handleLogoClick = () => {
  const usersStatsModalWindow = document.querySelector(".popup_type_info");
  const popupInfoList = usersStatsModalWindow.querySelector(".popup__info");
  const popupUserList = usersStatsModalWindow.querySelector(".popup__list");
  
  getCardList()
    .then((cards) => {
      popupInfoList.innerHTML = "";
      popupUserList.innerHTML = "";
      
      // Собираем статистику по пользователям
      const userStats = {};
      cards.forEach(card => {
        const userId = card.owner._id;
        if (!userStats[userId]) {
          userStats[userId] = {
            user: card.owner,
            count: 0
          };
        }
        userStats[userId].count++;
      });
      
      // Сортируем пользователей по количеству карточек (от большего к меньшему)
      const sortedUsers = Object.values(userStats).sort((a, b) => b.count - a.count);
      
      // Добавляем статистику
      popupInfoList.append(
        createInfoString("Всего карточек:", cards.length)
      );
      
      // Первая и последняя карточки
      if (cards.length > 0) {
        const sortedCards = [...cards].sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        popupInfoList.append(
          createInfoString("Первая создана:", formatDate(new Date(sortedCards[0].createdAt)))
        );
        
        popupInfoList.append(
          createInfoString("Последняя создана:", formatDate(new Date(sortedCards[sortedCards.length - 1].createdAt)))
        );
      }
      
      // Статистика по пользователям
      popupInfoList.append(
        createInfoString("Всего пользователей:", Object.keys(userStats).length)
      );
      
      // Максимум карточек от одного пользователя
      if (sortedUsers.length > 0) {
        popupInfoList.append(
          createInfoString("Максимум карточек от одного:", sortedUsers[0].count)
        );
      }
      
      // Добавляем всех пользователей в список
      sortedUsers.forEach(userStat => {
        const userItem = createUserPreview(userStat.user);
        // Можно добавить количество карточек пользователя в подсказку или как текст
        userItem.title = `${userStat.user.name} (${userStat.count} карточек)`;
        popupUserList.append(userItem);
      });
      
      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log("Ошибка при загрузке статистики:", err);
    });
};

const logo = document.querySelector(".logo");
logo.addEventListener("click", handleLogoClick);


const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);
