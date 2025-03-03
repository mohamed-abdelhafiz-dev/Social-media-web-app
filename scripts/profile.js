import {
  baseUrl,
  setupUI,
  showAlert,
  clearInputs,
  editPost,
  deletePost,
  toggleLoader,
} from "./main.js";
setupUI();
const searchParams = new URLSearchParams(window.location.search);
const userId = searchParams.get("userId");
async function getUser(userId) {
  return (await axios.get(`${baseUrl}/users/${userId}`)).data.data;
}
async function getUserPosts(userId) {
  return (await axios.get(`${baseUrl}/users/${userId}/posts`)).data.data;
}
async function renderUserPosts() {
  toggleLoader(true);
  const posts = await getUserPosts(userId);
  toggleLoader(false);
  if (!posts.length) {
    document.getElementById(
      "posts"
    ).innerHTML = `<h3 class='text-center text-secondary fst-italic' style='margin-top:120px'>The user hasn't posted yet.</h3>`;
    return;
  }
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
  document.getElementById("posts").innerHTML = postsHTML;
  document.querySelectorAll(".post").forEach((post) => {
    const postId = post.dataset.postId;
    post.addEventListener("click", () => {
      window.location.href = `../postDetails.html?postId=${postId}`;
    });
  });
  document.querySelectorAll(".edit-post-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const postId_1 = JSON.parse(decodeURIComponent(btn.dataset.postId));
      document.getElementById("edit-post-hidden-input").value = postId_1;
      toggleLoader(true);
      const response = await axios.get(`${baseUrl}/posts/${postId_1}`);
      const post_2 = response.data.data;
      toggleLoader(false);
      const editPostTitleInput = document.querySelector(
        "#edit-post-title-input"
      );
      const editPostBodyInput = document.querySelector("#edit-post-body-input");
      editPostTitleInput.value = post_2.title;
      editPostBodyInput.value = post_2.body;
    });
  });
  document.querySelectorAll(".delete-post-btn").forEach((btn_1) => {
    btn_1.addEventListener("click", async (e_1) => {
      e_1.stopPropagation();
      const postId_2 = JSON.parse(decodeURIComponent(btn_1.dataset.postId));
      document.getElementById("delete-post-hidden-input").value = postId_2;
    });
  });
}
async function renderProfileHeader() {
  toggleLoader(true);
  const currentUser = await getUser(userId);
  toggleLoader(false);
  const profileImage =
    typeof currentUser.profile_image === "object" ||
    currentUser.profile_image.search("localhost")
      ? "images/profile-img-blank.png"
      : currentUser.profile_image;
  document.getElementById("profile-img").src = profileImage;
  document.getElementById("profile-name").innerHTML = currentUser.name;
  document.getElementById("profile-username").innerHTML = currentUser.username;
  document.getElementById("profile-email").innerHTML = currentUser.email;
  document.getElementById("posts-count").innerHTML = currentUser.posts_count;
  document.getElementById("comments-count").innerHTML =
    currentUser.comments_count;
  document.getElementById(
    "profile-header-profile-name"
  ).innerHTML = `${currentUser.name}'s Posts`;
}
if (userId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && userId != user.id) {
    document.getElementById("add-post-btn").classList.add("d-none");
  }
  await renderProfileHeader();
  await renderUserPosts();
} else {
  showAlert("Login to see your profile", "danger");
}

const addPostBtn = document.getElementById("create-post-btn");
addPostBtn.addEventListener("click", async () => {
  const postTitle = document.getElementById("post-title-input").value;
  const postBody = document.getElementById("post-body-input").value;
  const postImage = document.getElementById("post-image-input").files[0];
  const token = localStorage.getItem("token");
  try {
    const formdata = new FormData();
    formdata.append("title", postTitle);
    formdata.append("body", postBody);
    if (postImage) formdata.append("image", postImage);
    toggleLoader(true);
    await axios.post(`${baseUrl}/posts`, formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: `Bearer ${token}`,
      },
    });
    toggleLoader(false);
    document.getElementById("create-post-modal-close-btn").click();
    clearInputs();
    showAlert("Post created successfully.", "success");
    renderProfileHeader();
    renderUserPosts();
  } catch (addPostError) {
    const error = addPostError.response.data.message;
    showAlert(error, "danger");
    toggleLoader(false);
  }
});

document
  .getElementById("modal-edit-post-btn")
  .addEventListener("click", async () => {
    const postId = document.getElementById("edit-post-hidden-input").value;
    await editPost(postId);
    renderProfileHeader();
    renderUserPosts();
  });
document
  .getElementById("modal-delete-post-btn")
  .addEventListener("click", async () => {
    const postId = document.getElementById("delete-post-hidden-input").value;
    await deletePost(postId);
    renderProfileHeader();
    renderUserPosts();
  });
