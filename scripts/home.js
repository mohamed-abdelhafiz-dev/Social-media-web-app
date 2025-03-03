import {
  getPosts,
  renderPosts,
  setupUI,
  showAlert,
  baseUrl,
  clearInputs,
  editPost,
  deletePost,
  toggleLoader,
} from "./main.js";

setupUI();

let currentPage = 1;
const lastPage = await getPosts(currentPage).then(renderPosts);

window.addEventListener("scroll", async () => {
  const pageEnded =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight;

  if (pageEnded && currentPage < lastPage) {
    await getPosts(++currentPage).then(renderPosts);
    document.querySelectorAll(".post-author").forEach((author) => {
      author.addEventListener("click", (e) => {
        e.stopPropagation();
        const userId = author.dataset.id;
        window.location.href = `profile.html?userId=${userId}`;
      });
    });
  }
});

const addPostBtn = document.getElementById("create-post-btn");
addPostBtn.addEventListener("click", async () => {
  toggleLoader(true);
  const postTitle = document.getElementById("post-title-input").value;
  const postBody = document.getElementById("post-body-input").value;
  const postImage = document.getElementById("post-image-input").files[0];
  const token = localStorage.getItem("token");
  try {
    const formdata = new FormData();
    formdata.append("title", postTitle);
    formdata.append("body", postBody);
    if (postImage) {
      formdata.append("image", postImage);
    }
    await axios.post(`${baseUrl}/posts`, formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: `Bearer ${token}`,
      },
    });
    document.getElementById("create-post-modal-close-btn").click();
    clearInputs();
    showAlert("Post created successfully.", "success");
    getPosts(1).then(renderPosts);
  } catch (addPostError) {
    const error = addPostError.response.data.message;
    showAlert(error, "danger");
  }
  toggleLoader(false);
});

document.getElementById("modal-edit-post-btn").addEventListener("click", () => {
  const postId = document.getElementById("edit-post-hidden-input").value;
  editPost(postId);
});
document
  .getElementById("modal-delete-post-btn")
  .addEventListener("click", () => {
    const postId = document.getElementById("delete-post-hidden-input").value;
    deletePost(postId);
  });

document.querySelectorAll(".post-author").forEach((author) => {
  author.addEventListener("click", (e) => {
    e.stopPropagation();
    const userId = author.dataset.id;
    window.location.href = `profile.html?userId=${userId}`;
  });
})