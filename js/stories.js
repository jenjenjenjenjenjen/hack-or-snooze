"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <small class="favorite">&#9733;</small>
        <small class="delete">delete</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function putNewStoryOnPage(evt) {
  evt.preventDefault();
  console.debug("putNewStoryOnPage");

  const title = $("#new-story-title").val();
  const author = $("#new-story-author").val();
  const url = $("#new-story-url").val();
  const username = currentUser.username;
  const storyData = {title, url, author, username};

  let newStory;
  newStory = await storyList.addStory(currentUser, storyData);

  const story = generateStoryMarkup(newStory);
  $allStoriesList.prepend(story);
}

$("#new-story-form").on("submit", putNewStoryOnPage);

async function handleFavorite(evt) {
  const storyId = evt.target.parentElement.id;
  let story = await axios({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "GET"
  });
  console.log(story)
  const result = evt.target.classList.toggle("favorited");
  if (result) {
    evt.target.style.color = "yellow";
    await addFavorite(story.data.story);
  } else {
    evt.target.style.color = "";
    await removeFavorite(story.data.story);
  }
  saveFavoritesToLocalStorage();
}

$(".stories-container").on("click", ".favorite", handleFavorite);

function saveFavoritesToLocalStorage() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
};


function generateFavoritesList() {
  for (let story of favorites) {
    const $fav = generateStoryMarkup(story);
    $favoriteStoriesList.append($fav);
  }
}

async function handleDelete(evt) {
  const storyId = evt.target.parentElement.id;
  let story = await axios({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "GET"
  });
  deleteStory(story.data.story)
}

$(".stories-container").on("click", ".delete", handleDelete)