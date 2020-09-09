
$(async function() {

  // cache some selectors we'll be using quite a bit
  const $allStoriesList = $("#all-articles-list");
  const $submitForm = $("#submit-form");
  const $filteredArticles = $("#filtered-articles");
  const $loginForm = $("#login-form");
  const $createAccountForm = $("#create-account-form");
  const $ownStories = $("#my-articles");
  const $navLogin = $("#nav-login");
  const $navLogOut = $("#nav-logout");
  const $navFavorites= $('#nav-favorites');
  const $navSubmit = $('#nav-submit');
  const $navMystories = $('#nav-my-stories');
  const $author = $('#author');
  const $title = $('#title');
  const $url = $('#url');
  const $userOptions = $('.user-options');
  const $favoritedArticles = $('#favorited-articles');
  const $myArticles = $('#my-articles');
  const $userWelcome = $('#nav-welcome');
  const $navUserName = $('#nav-user-profile');
  const $userProfile = $('#user-profile');

  // global icon constants
  const FAVORITE = "fas fa-star";
  const NOT_FAVORITE = 'far fa-star'; 

  // hide user profile
  $userProfile.hide();

  // global storyList variable
  let storyList = null;

  // global currentUser variable
  let currentUser = null;

  await checkIfLoggedIn();

  /**
   * Event listener for logging in.
   *  If successfully we will setup the user instance
   */

  $loginForm.on("submit", async function(evt) {
    evt.preventDefault(); // no page-refresh on submit

    // grab the username and password
    const username = $("#login-username").val();
    const password = $("#login-password").val();

    // call the login static method to build a user instance
    const userInstance = await User.login(username, password);
    // set the global user to the user instance
    currentUser = userInstance;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });

  /**
   * Event listener for signing up.
   *  If successfully we will setup a new user instance
   */

  $createAccountForm.on("submit", async function(evt) {
    evt.preventDefault(); // no page refresh

    // grab the required fields
    let name = $("#create-account-name").val();
    let username = $("#create-account-username").val();
    let password = $("#create-account-password").val();

    // call the create method, which calls the API and then builds a new user instance
    const newUser = await User.create(username, password, name);
    currentUser = newUser;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });

  /**
   * Log Out Functionality
   */

  $navLogOut.on("click", function() {

    // empty out local storage
    localStorage.clear();
    // refresh the page, clearing memory
    location.reload();
  });

  /**
   * Event Handler for Clicking Login
   */

  $navLogin.on("click", function() {
    // Show the Login and Create Account Forms
    $loginForm.slideToggle();
    $createAccountForm.slideToggle();
    $allStoriesList.toggle();
  });

  /**
   * Event handler for Navigation to Homepage
   */

  $("body").on("click","#nav-all", async function(event) {

    event.preventDefault();
    hideElements();
    $allStoriesList.show();
  });

  /**
   * On page load, checks local storage to see if the user is already logged in.
   * Renders page information accordingly.
   */

  async function checkIfLoggedIn() {
    // let's see if we're logged in
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // if there is a token in localStorage, call User.getLoggedInUser
    //  to get an instance of User with the right details
    //  this is designed to run once, on page load
    currentUser = await User.getLoggedInUser(token, username);
    
    await generateStories();

    if (currentUser) {
      setUserProfile();
      showNavForLoggedInUser();
      generateFavoritesList(currentUser);
      generateOwnerStories(currentUser);
    }

    return currentUser;
  }

  /**
   * A rendering function to run to reset the forms and hide the login info
   */

  function loginAndSubmitForm() {
    // hide the forms for logging in and signing up
    $loginForm.hide();
    $createAccountForm.hide();

    // reset those forms
    $loginForm.trigger("reset");
    $createAccountForm.trigger("reset");

    // show the stories
    $allStoriesList.show();

    // set user profile
    setUserProfile();

    // update the navigation bar
    showNavForLoggedInUser();
  }

  /**
   * A rendering function to call the StoryList.getStories static method,
   *  which will generate a storyListInstance. Then render it.
   */
  async function generateStories() {

    // get an instance of StoryList
    const storyListInstance = await StoryList.getStories();

    // update our global variable
    storyList = storyListInstance;

    // empty out that part of the page
    $allStoriesList.empty();
    $favoritedArticles.empty();
    $myArticles.empty();
    
    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {

      let isFavorite;

      if(currentUser){
        isFavorite = checkIfFavorite(story) ? FAVORITE : NOT_FAVORITE;
      }

      const result = generateStoryHTML(story);
      result.prepend(addFavoriteIcon(isFavorite));
      $allStoriesList.append(result);
    }
  }

  function addFavoriteIcon(icon){

    return `<span><i class="favorited ${icon}"></i></span>`;
  }

  function generateFavoritesList(user){

    for(let story of user.favorites){

      generateFavorite(story);
    }
  }

  function generateFavorite(story){

    const favoriteStory = generateStoryHTML(story);
    favoriteStory.css("list-style-type","none");
    favoriteStory.prepend(addFavoriteIcon(FAVORITE));
    $('#favorited-articles').append(favoriteStory);
  }

  function generateOwnerStories(user){

    for(let story of user.ownStories){

      generateOwnerStory(story);
    }
  }

  function generateOwnerStory(story){

    const isFavorite = checkIfFavorite(story) ? FAVORITE : NOT_FAVORITE;
    const ownerStory = generateStoryHTML(story);
    ownerStory.css("list-style-type","none");
    ownerStory.prepend(addFavoriteIcon(isFavorite));
    ownerStory.prepend($('<i class="deleteButton fas fa-trash-alt"></i>'));
    $('#my-articles').append(ownerStory);

  }

  function checkIfFavorite(story){

    let result=false;

    for(let favorite of currentUser.favorites){

      if(favorite.storyId==story.storyId){

        result =  true;
      }
    }
    return result;
  }

  /**
   * A function to render HTML for an individual Story instance
   */

  function generateStoryHTML(story) {

    let hostName = getHostName(story.url);  
    
    // render story markup
    const storyMarkup = $(`
      <li id="${story.storyId}" data-user="${story.username}">
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong>${story.title}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
        <small class="article-username">posted by ${story.username}</small>
      </li>
    `);

  
    return storyMarkup;
  }

  /* hide all elements in elementsArr */

  function hideElements() {
    const elementsArr = [
      $submitForm,
      $allStoriesList,
      $filteredArticles,
      $ownStories,
      $loginForm,
      $createAccountForm,
      $favoritedArticles,
      $myArticles,
      $userProfile
    ];
    elementsArr.forEach($elem => $elem.hide());
  }

  function showNavForLoggedInUser() {

    $navLogin.hide();
    $navLogOut.show();
    $userOptions.show();
    $userWelcome.show();
    $navUserName.text(`${currentUser.username}`);
  }

  function setUserProfile(){

    $('#profile-name').text($('#profile-name').text()+ ' ' + `${currentUser.name}`);
    $('#profile-username').text($('#profile-username').text()+ ' ' + `${currentUser.username}`);
    $('#profile-account-date').text($('#profile-account-date').text()+ ' ' + `${currentUser.createdAt}`);

  }

  /* simple function to pull the hostname from a URL */

  function getHostName(url) {
    let hostName;
    if (url.indexOf("://") > -1) {
      hostName = url.split("/")[2];
    } else {
      hostName = url.split("/")[0];
    }
    if (hostName.slice(0, 4) === "www.") {
      hostName = hostName.slice(4);
    }
    return hostName;
  }

  /* sync current user information to localStorage */

  function syncCurrentUserToLocalStorage() {
    if (currentUser) {
      localStorage.setItem("token", currentUser.loginToken);
      localStorage.setItem("username", currentUser.username);
    }
  }

  $submitForm.on("submit", async function(event){

    event.preventDefault();

    const newPost = await storyList.addStory(currentUser, {
                              
      author: $author.val(),
      title:$title.val(),
      url:$url.val()
    });

    $author.val("");
    $title.val("");
    $url.val("");


    generateOwnerStory(newPost);
    const newGenPost = generateStoryHTML(newPost);
    newGenPost.prepend(addFavoriteIcon(NOT_FAVORITE));
    $allStoriesList.prepend(newGenPost);
    

    $submitForm.hide();
  });


  // TO-DO: make dedicated favorites handler function
  $(".articles-container").on("click",".favorited", async function(event){

    if(currentUser){
      
      // declare variables
      const storyId =  $(event.target).parent().parent().prop("id");
      const favorited = await currentUser.isStoryFavorite(storyId);

      favoriteHandler(storyId,favorited,event);
    }
    
    else{

      alert('You must be logged in to favorite posts!');
    }
  });

  function favoriteHandler(storyId,favorited){

      if(favorited){

        // change all stars
        updateAllListFavoriteIcons(storyId, favorited);
        
        // remove item to favorites list html
        removeStoryFromList(storyId, $favoritedArticles);

        // remove favorite from server
        currentUser.removeFavorite(storyId);
      }
      else{

        // change all stars
        updateAllListFavoriteIcons(storyId, favorited);

        // add item to favorites list html
        const newStory = getStoryById(storyId);
        generateFavorite(newStory);

        // send post request
        currentUser.addFavorite(storyId);
      }

  }

  function getStoryById(currentStoryId){

    let selectedStory;

    for(let story of storyList.stories){

      if(story.storyId == currentStoryId){

        selectedStory = story;
      }
    }

    return selectedStory;
  }

  function addStoryToList(list,story){

    list.append(story);
  }

  function removeStoryFromList(storyId,list){

    list.find(`#${storyId}`).remove();
  }

  function updateAllListFavoriteIcons(storyId, favorited){

    updateFavoriteStatus($allStoriesList,storyId,favorited);
    updateFavoriteStatus($myArticles,storyId,favorited);
  }

  function updateFavoriteStatus(list, storyId, favorited){

    if(favorited){

      $(list).find(`#${storyId}`).find('.favorited').removeClass("fas");
      $(list).find(`#${storyId}`).find('.favorited').addClass("far");
    }
    else{

      $(list).find(`#${storyId}`).find('.favorited').removeClass("far");
      $(list).find(`#${storyId}`).find('.favorited').addClass("fas");
    } 
  }

  function deleteAll(storyId){

    $myArticles.find(`#${storyId}`).remove();
    $favoritedArticles.find(`#${storyId}`).remove();
    $allStoriesList.find(`#${storyId}`).remove();
  }

  $navFavorites.on("click", async function(event){

    hideElements();
    $favoritedArticles.show();
  });

  $navMystories.on("click", async function(event){

    hideElements();
    $myArticles.show();
    
  });

  /**
 * Event Handler for Clicking Submit*/
  $navSubmit.on("click", function(evt) {

    $userProfile.hide()
    $favoritedArticles.hide();
    $myArticles.hide();
    $allStoriesList.show();

    if($submitForm.is(":visible")){

      $submitForm.hide();
    }
    else if($submitForm.is(":hidden")){
      $submitForm.show();
    }
  });

  $navUserName.on("click",function(){

    hideElements();
    $userProfile.show();

  });

  $myArticles.on("click",'.deleteButton', async function(event){

    const storyId = $(event.target).parent().prop("id");
    deleteAll(storyId);
    await currentUser.deleteStory(storyId);

  });
});
