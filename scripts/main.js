export function setupUI() {
  clearInputs();
  const theme = localStorage.getItem("theme") || "dark";
  if (theme === "dark") {
    document.querySelector("html").setAttribute("data-bs-theme", "dark");
    document.getElementById("light-toggler").classList.remove("d-none");
    document.getElementById("dark-toggler").classList.add("d-none");
  } else if (theme === "light") {
    document.querySelector("html").removeAttribute("data-bs-theme");
    document.getElementById("light-toggler").classList.add("d-none");
    document.getElementById("dark-toggler").classList.remove("d-none");
  }
  const loginBtnsDiv = document.getElementById("login-container");
  const logoutBtnDiv = document.getElementById("logout-container");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const addPostBtn = document.getElementById("add-post-btn");
  const addCommentBtn = document.getElementById("add-comment");
  if (token) {
    loginBtnsDiv.style.setProperty("display", "none", "important");
    logoutBtnDiv.style.setProperty("display", "flex", "important");
    if (typeof user.profile_image === "object") {
      document.querySelector("#logout-container img").src =
        "images/profile-img-blank.png";
    } else {
      document.querySelector("#logout-container img").src = user.profile_image;
    }
    document.querySelector("#logout-container span").innerHTML = user.name;
    if (addPostBtn) {
      addPostBtn.classList.remove("d-none");
    }
    if (addCommentBtn) {
      addCommentBtn.classList.remove("d-none");
    }
    return;
  }
  loginBtnsDiv.style.setProperty("display", "flex", "important");
  logoutBtnDiv.style.setProperty("display", "none", "important");
  if (addPostBtn) {
    addPostBtn.classList.add("d-none");
  }

  if (addCommentBtn) {
    addCommentBtn.classList.add("d-none");
  }
}
export function handleLoginError(loginError) {
  const errors = JSON.stringify(Object.keys(loginError.response.data.errors));
  switch (errors) {
    case `["email"]`:
      showAlert("Invalid username or password", "danger");
      break;
    case `["username"]`:
      addEmptyInputClass(usernameInput);
      break;
    case `["password"]`:
      if (
        loginError.response.data.errors.password[0] ===
        "The password field is required."
      ) {
        addEmptyInputClass(passwordInput);
      } else {
        showAlert("The password must be at least 6 characters.", "danger");
      }
      break;
    case `["username","password"]`:
      addEmptyInputClass(usernameInput);
      addEmptyInputClass(passwordInput);
      break;
    default:
      showAlert("try again later.", "danger");
  }
}
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const modalLoginBtn = document.getElementById("modal-login-btn");
const modalRegisterBtn = document.getElementById("modal-register-btn");
const registerNameInput = document.getElementById("register-name-input");
const registerUsernameInput = document.getElementById(
  "register-username-input"
);
const registerPasswordInput = document.getElementById(
  "register-password-input"
);
const registerEmailInput = document.getElementById("register-email-input");
const logoutBtn = document.getElementById("logout-btn");
export async function modalLoginBtnClicked() {
  const username = usernameInput.value;
  const password = passwordInput.value;
  try {
    toggleLoader(true);
    const response = await axios.post(`${baseUrl}/login`, {
      username,
      password,
    });
    toggleLoader(false);
    const token = response.data.token;
    const user = response.data.user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    usernameInput.value = passwordInput.value = "";
    document.getElementById("login-modal-close-btn").click();
    showAlert("Logged in successfully.", "success");
    setupUI();
  } catch (loginError) {
    handleLoginError(loginError);
    toggleLoader(false);
    return Promise.reject();
  }
}
export async function modalRegisterBtnClicked() {
  const name = registerNameInput.value;
  const username = registerUsernameInput.value;
  const password = registerPasswordInput.value;
  const image = document.getElementById("user-image-input").files[0];
  const email = registerEmailInput.value;
  try {
    const formdata = new FormData();
    formdata.append("name", name);
    formdata.append("username", username);
    formdata.append("password", password);
    if (image) {
      formdata.append("image", image);
    }

    formdata.append("email", email);
    toggleLoader(true);
    const response = await axios.post(`${baseUrl}/register`, formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toggleLoader(false);
    const token = response.data.token;
    const user = response.data.user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    registerNameInput.value =
      registerUsernameInput.value =
      registerPasswordInput.value =
      document.getElementById("register-email-input").value =
        "";
    document.getElementById("register-modal-close-btn").click();
    showAlert("Signed up successfully.", "success");
    setupUI();
  } catch (signupError) {
    const message = signupError.response.data.message;
    showAlert(message, "danger");
    toggleLoader(false);
    return Promise.reject();
  }
}
export function logoutBtnClicked() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAlert("Logged out successfully.", "success");
  setupUI();
}
modalLoginBtn.addEventListener("click", async () => {
  try {
    await modalLoginBtnClicked();
  } catch (error) {
    return;
  }
  if (window.location.href.includes("profile")) {
    const currentUserId = JSON.parse(localStorage.getItem("user")).id;
    const url = new URL(window.location.href);
    url.searchParams.set("userId", currentUserId);
    window.location.href = url.toString();
    return;
  }
  window.location.reload();
});
modalRegisterBtn.addEventListener("click", async () => {
  try {
    await modalRegisterBtnClicked();
  } catch (error) {
    return;
  }
  if (window.location.href.includes("profile")) {
    const currentUserId = JSON.parse(localStorage.getItem("user")).id;
    const url = new URL(window.location.href);
    url.searchParams.set("userId", currentUserId);
    window.location.href = url.toString();
    return;
  }
  window.location.reload();
});
logoutBtn.addEventListener("click", () => {
  logoutBtnClicked();
  window.location.reload();
});

document
  .querySelectorAll(".btn-close, #login-modal-close-btn")
  .forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      usernameInput.classList.remove("empty-input");
      passwordInput.classList.remove("empty-input");
    });
  });
document.querySelector("#login-modal").addEventListener("click", (event) => {
  if (event.target !== document.querySelector(".modal-content")) {
    usernameInput.classList.remove("empty-input");
    passwordInput.classList.remove("empty-input");
  }
});
document.addEventListener("visibilitychange", () => {
  setupUI();
});

export function clearInputs() {
  const postTitleInput = document.getElementById("post-title-input");
  const postBodyInput = document.getElementById("post-body-input");
  if (postBodyInput && postTitleInput) {
    postTitleInput.value = postBodyInput.value = "";
  }
  const usernameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");
  const registerNameInput = document.getElementById("register-name-input");
  const registerUsernameInput = document.getElementById(
    "register-username-input"
  );
  const registerPasswordInput = document.getElementById(
    "register-password-input"
  );
  const registerEmailInput = document.getElementById("register-email-input");
  usernameInput.value =
    passwordInput.value =
    registerNameInput.value =
    registerUsernameInput.value =
    registerPasswordInput.value =
    registerEmailInput.value =
      "";
}

document.querySelector(".dark-mode").addEventListener("click", () => {
  const theme = localStorage.getItem("theme") || "dark";
  if (theme === "dark") {
    document.querySelector("html").removeAttribute("data-bs-theme");
    document.getElementById("light-toggler").classList.add("d-none");
    document.getElementById("dark-toggler").classList.remove("d-none");
    localStorage.setItem("theme", "light");
    return;
  }
  if (theme !== "light") {
    return;
  }
  document.querySelector("html").setAttribute("data-bs-theme", "dark");
  document.getElementById("light-toggler").classList.remove("d-none");
  document.getElementById("dark-toggler").classList.add("d-none");
  localStorage.setItem("theme", "dark");
});

export function addEmptyInputClass(inputField) {
  inputField.classList.add("empty-input");
}

export function showAlert(message, type) {
  const alertPlaceholder = document.getElementById("alert");
  const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };
  appendAlert(message, type);
  setTimeout(() => {
    const alertCloseBtn = document.querySelector(
      ".btn-close:not([data-is-in-modal='true'])"
    );
    if (alertCloseBtn) {
      alertCloseBtn.click();
    }
  }, 2000);
}
export const baseUrl = "https://tarmeezacademy.com/api/v1";

export async function editPost(postId) {
  try {
    toggleLoader(true);
    let editPostTitle = document.getElementById("edit-post-title-input").value;
    const editPostBody = document.getElementById("edit-post-body-input").value;
    if (!editPostTitle.length) {
      editPostTitle = null;
    }
    if (!editPostBody.length) {
      throw "Body field is required.";
    }
    const editPostImage = document.getElementById("edit-post-image-input")
      .files[0];
    const token = localStorage.getItem("token");

    const formdata = new FormData();
    formdata.append("title", editPostTitle);
    formdata.append("body", editPostBody);

    if (editPostImage) {
      formdata.append("image", editPostImage);
    }

    formdata.append("_method", "put"); // Only needed if your API requires it
    await axios.post(`${baseUrl}/posts/${postId}`, formdata, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    toggleLoader(false);
    document.getElementById("edit-post-modal-close-btn").click();
    showAlert("Post updated successfully.", "success");
    if (location.href.includes("index")) {
      getPosts(1).then(renderPosts);
    } else if (location.href.includes("postDetails")) {
      renderPost(postId).then(setupUI);
    }
  } catch (editPostError) {
    if (editPostError === "Body field is required.") {
      showAlert(editPostError, "danger");
      toggleLoader(false);
      return;
    }
    const error =
      editPostError.response?.data?.error_message || "Something went wrong.";
    showAlert(error, "danger");
    toggleLoader(false);
  }
}
export async function deletePost(postId) {
  try {
    toggleLoader(true);
    const token = localStorage.getItem("token");
    await axios.delete(`${baseUrl}/posts/${postId}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    toggleLoader(false);
    document.getElementById("delete-post-modal-close-btn").click();
    showAlert("Post deleted successfully.", "success");
    if (location.href.includes("index")) {
      getPosts(1).then(renderPosts);
    } else if (location.href.includes("postDetails")) {
      location.href = "index.html";
    }
  } catch (deletePostError) {
    const error =
      deletePostError.response?.data?.error_message || "Something went wrong.";
    showAlert(error, "danger");
    toggleLoader(false);
  }
}

export function getPosts(page) {
  return new Promise((resolve, reject) => {
    toggleLoader(true);
    axios
      .get(`${baseUrl}/posts?limit=10&page=${page}`)
      .then((response) => {
        toggleLoader(false);
        const posts = response.data.data;
        const last_page = response.data.meta.last_page;
        resolve({ posts, page, last_page });
      })
      .catch((error) => {
        toggleLoader(false);
      });
  });
}
export function renderPosts({ posts, page, last_page }) {
  let postsHTML = ``;
  posts.forEach((post) => {
    let isMyPost = false;
    if (localStorage.getItem("token") && localStorage.getItem("user")) {
      const currentUserId = JSON.parse(localStorage.getItem("user")).id;
      if (post.author.id === currentUserId) {
        isMyPost = true;
      }
    }
    const editDeleteBtnsHtml = isMyPost
      ? `<button  data-bs-toggle="modal"
                    data-bs-target="#delete-post-modal" class='border-0 btn btn-sm btn-outline-danger ms-1 float-end delete-post-btn'
                    data-post-id='${encodeURIComponent(
                      JSON.stringify(post.id)
                    )}'>
                      <i class="bi bi-trash"></i>
                  </button>
                  
                  <button  data-bs-toggle="modal"
                    data-bs-target="#edit-post-modal" class='border-0 btn btn-sm btn-outline-secondary float-end edit-post-btn'
                    data-post-id='${encodeURIComponent(
                      JSON.stringify(post.id)
                    )}'>
                      <i class="bi bi-pencil-fill"></i>
                  </button>
                `
      : ``;
    let tagsHTML = "";
    const author = post.author;
    post.tags.forEach((tag) => {
      tagsHTML += `<span class="badge text-bg-secondary ms-1 p-2 d-inline-block">${tag.name}</span>`;
    });
    postsHTML += `<div class="post shadow" style='cursor:pointer' data-post-id=${
      post.id
    }>
              <div class="card">
                <div class="card-header">
                <div class="d-inline-block post-author" data-id='${author.id}'>
                  <img
                    class="profile-img rounded-circle border border-2"
                    src=${
                      typeof author.profile_image === "object" ||
                      author.profile_image.search("localhost")
                        ? "images/profile-img-blank.png"
                        : author.profile_image
                    }
                    alt="profile img"
                  />
                  <strong class="user-name">${author.name}</strong>
                </div>
                  ${editDeleteBtnsHtml}
                </div>
                <div class="card-body">
                  ${
                    typeof post.image === "object"
                      ? ""
                      : `<img
                    class="w-100 post-image rounded-2"
                    src=${post.image}
                    alt=""
                  />`
                  }
                  <div class="d-flex align-items-center">
                    <!-- <i class="bi bi-dot text-secondary fs-5"></i> -->
                    <span class="fs-6 text-secondary">${post.created_at}</span>
                  </div>
                  <h5 class="mt-3">${
                    post.title && post.title !== "null" ? post.title : ""
                  }</h5>
                  <p>${post.body}</p>
                  <hr />
                  <div class="comments d-flex">
                    <i class="bi bi-pen me-2" style="cursor: pointer"></i>
                    <span>(${post.comments_count}) Comments</span>
                    <div class="tags d-flex align-items-center ms-2">
                        ${tagsHTML}
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
  });
  if (page === 1) {
    document.getElementById("posts").innerHTML = postsHTML;
  } else document.getElementById("posts").innerHTML += postsHTML;
  document.querySelectorAll(".post").forEach((post) => {
    const postId = post.dataset.postId;
    post.addEventListener("click", () => {
      window.location.href = `../postDetails.html?postId=${postId}`;
    });
  });
  document.querySelectorAll(".edit-post-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const postId = JSON.parse(decodeURIComponent(btn.dataset.postId));
      document.getElementById("edit-post-hidden-input").value = postId;
      toggleLoader(true);
      const response = await axios.get(`${baseUrl}/posts/${postId}`);
      toggleLoader(false);
      const post = response.data.data;
      const editPostTitleInput = document.querySelector(
        "#edit-post-title-input"
      );
      const editPostBodyInput = document.querySelector("#edit-post-body-input");
      editPostTitleInput.value = post.title;
      editPostBodyInput.value = post.body;
    });
  });
  document.querySelectorAll(".delete-post-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const postId = JSON.parse(decodeURIComponent(btn.dataset.postId));
      document.getElementById("delete-post-hidden-input").value = postId;
    });
  });
  return last_page;
}

export async function getPost(postId) {
  const response = await axios.get(`${baseUrl}/posts/${postId}`);
  return response.data.data;
}
export async function renderPost(postId) {
  try {
    toggleLoader(true);
    const post = await getPost(postId);
    toggleLoader(false);
    let isMyPost = false;
    if (localStorage.getItem("token") && localStorage.getItem("user")) {
      const currentUserId = JSON.parse(localStorage.getItem("user")).id;
      if (post.author.id === currentUserId) {
        isMyPost = true;
      }
    }
    const editDeleteBtnsHtml = isMyPost
      ? `<button  data-bs-toggle="modal"
                    data-bs-target="#delete-post-modal" class='border-0 btn btn-sm btn-outline-danger ms-1 float-end delete-post-btn'
                    data-post-id='${encodeURIComponent(
                      JSON.stringify(post.id)
                    )}'>
                      <i class="bi bi-trash"></i>
                  </button>
                  
                  <button  data-bs-toggle="modal"
                    data-bs-target="#edit-post-modal" class='border-0 btn btn-sm btn-outline-secondary float-end edit-post-btn'
                    data-post-id='${encodeURIComponent(
                      JSON.stringify(post.id)
                    )}'>
                      <i class="bi bi-pencil-fill"></i>
                  </button>
                `
      : ``;
    const comments = post.comments;
    let commentHTML = ``;
    comments.forEach((comment) => {
      commentHTML += `
      <div id="comment" class="mt-3">
                          <div class="comment-author">
                            <img
                              class="profile-img-comment rounded-circle border border-2"
                              src=${
                                typeof comment.author.profile_image ===
                                  "object" ||
                                comment.author.profile_image.search("localhost")
                                  ? "images/profile-img-blank.png"
                                  : comment.author.profile_image
                              }
                              alt="profile img"
                            />
                            <span class="user-name fs-6">${
                              comment.author.name
                            }</span>
                          </div>
                          <div class="comment-body mt-2 ms-1 fs-6">
                            ${comment.body}
                          </div>
      </div>
  `;
    });
    let tagsHTML = ``;
    post.tags.forEach((tag) => {
      tagsHTML += `<span class="badge text-bg-secondary ms-1 p-2 d-inline-block">${tag.name}</span>`;
    });
    document.getElementById(
      "post-author"
    ).innerHTML = `${post.author.name}'s post`;
    document.getElementById("post").innerHTML = `
            <div class="post shadow" >
              <div class="card">
                <div class="card-header">
                  <img
                    class="profile-img rounded-circle border border-2"
                    src=${
                      typeof post.author.profile_image === "object" ||
                      post.author.profile_image.search("localhost")
                        ? "images/profile-img-blank.png"
                        : post.author.profile_image
                    }
                    alt="profile img"
                  />
                  <strong class="user-name">${post.author.name}</strong>
                  ${editDeleteBtnsHtml}
                </div>
                <div class="card-body">
                  <div class="d-flex align-items-center">
                    <!-- <i class="bi bi-dot text-secondary fs-5"></i> -->
                    <span class="fs-6 text-secondary">${post.created_at}</span>
                  </div>
                  <h5 class="mt-3">${
                    post.title && post.title !== "null" ? post.title : ""
                  }</h5>
                  <p>${post.body}</p>
                  <hr />
                  <div id="comments">
                    <div class="comments-header d-flex">
                      <i class="bi bi-pen me-2" style="cursor: pointer"></i>
                      <span>(${post.comments_count}) Comments</span>
                      <div class="tags d-flex align-items-center ms-2">${tagsHTML}</div>
                    </div>

                    <div id="comments-body" class="mt-4 fw-lighter">
                      ${commentHTML}
                    </div>
                    <div id="add-comment" class="d-flex d-none mt-3">
                      <input type="text" class="form-control"
                      style="box-shadow:none;" placeholder="Add your comment here.." onfocus="this.classList.add('border-secondary')" onfocusout="this.classList.remove('border-secondary')">
                      <button type="submit" class="btn btn-outline-secondary ms-1 border-0">
                        <i class="bi bi-send-fill"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
    const addCommentBtn = document.querySelector("#add-comment button");
    const addCommentInput = document.querySelector("#add-comment input");

    addCommentBtn.addEventListener("click", () => {
      const commentBody = addCommentInput.value;
      if (commentBody.trim().length) {
        addComment(commentBody, postId);
      }
    });
    addCommentInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addCommentBtn.click();
      }
    });
    if (isMyPost) {
      document
        .querySelector(".edit-post-btn")
        .addEventListener("click", async function (e) {
          const postId = JSON.parse(decodeURIComponent(this.dataset.postId));
          document.getElementById("edit-post-hidden-input").value = postId;
          toggleLoader(true);
          const response = await axios.get(`${baseUrl}/posts/${postId}`);
          toggleLoader(false);
          const post = response.data.data;
          const editPostTitleInput = document.querySelector(
            "#edit-post-title-input"
          );
          const editPostBodyInput = document.querySelector(
            "#edit-post-body-input"
          );
          editPostTitleInput.value = post.title;
          editPostBodyInput.value = post.body;
        });

      document
        .querySelector(".delete-post-btn")
        .addEventListener("click", async function (e) {
          const postId = JSON.parse(decodeURIComponent(this.dataset.postId));
          document.getElementById("delete-post-hidden-input").value = postId;
        });
    }
  } catch (error) {
    toggleLoader(false);
    document.getElementById(
      "post"
    ).innerHTML = `<h1 class="text-center fs-4">Please, Try again later..</h1>`;
  }
}
function addComment(commentBody, postId) {
  toggleLoader(true);
  const token = localStorage.getItem("token");
  axios
    .post(
      `${baseUrl}/posts/${postId}/comments`,
      {
        body: commentBody,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(() => {
      renderPost(postId).then(setupUI);
      showAlert("Your comment has been added to this post.", "success");
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}
window.profileClicked = () => {
  let queryParam = ""; // Declare outside so it's accessible in all blocks
  try {
    queryParam = `?userId=${JSON.parse(localStorage.getItem("user")).id}`;
  } catch (error) {
  } finally {
    window.location.href = `profile.html${queryParam}`;
  }
};

export function toggleLoader(show) {
  if (show) {
    document.getElementById("loader").style.visibility = "visible";
  } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}
