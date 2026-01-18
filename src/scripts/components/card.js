export const createCardElement = (data, handlers, currentUserID) => {
  const { name, link, likes = [], owner, _id } = data;
  const cardTemplate = document.querySelector("#card-template").content;
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  cardImage.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==";
  cardImage.alt = name;
  
  const img = new Image();
  img.crossOrigin = "anonymous"; // Для CORS
  img.onload = () => {
    cardImage.src = link;
  };
  img.onerror = () => {
    cardImage.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";
    console.warn(`Не удалось загрузить изображение: ${link}`);
  };
  img.src = link;

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
    if (!cardImage.src.includes('data:image/svg+xml')) {
      handlers.onPreviewPicture({ name, link });
    }
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
