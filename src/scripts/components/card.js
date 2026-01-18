export const createCardElement = (data, handlers, currentUserID) => {
  const { name, link, likes = [], owner, _id } = data;
  const cardTemplate = document.querySelector("#card-template").content;
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  cardImage.src = link;
  cardImage.alt = name;
  cardTitle.textContent = name;
  
  likeCountElement.textContent = likes.length;
  
  const isLikedByCurrentUser = likes.some(like => like._id === currentUserID);
  if (isLikedByCurrentUser) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (owner._id !== currentUserID) {
    deleteButton.style.display = "none";
  }

  cardImage.addEventListener("click", () => {
    handlers.onPreviewPicture({ name, link });
  });

  deleteButton.addEventListener("click", () => {
    handlers.onDeleteCard(_id, cardElement);
  });

  likeButton.addEventListener("click", () => {
    handlers.onLikeIcon(_id, isLikedByCurrentUser, cardElement);
  });

  return cardElement;
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const updateLikeStatus = (cardElement, updatedLikes, currentUserID) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  
  likeCountElement.textContent = updatedLikes.length;
  
  const isLiked = updatedLikes.some(like => like._id === currentUserID);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  } else {
    likeButton.classList.remove("card__like-button_is-active");
  }
};
