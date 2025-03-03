import {
  setupUI,
  baseUrl,
  showAlert,
  editPost,
  deletePost,
  getPost,
  renderPost,
  toggleLoader,
} from "./main.js";
setupUI();
const searchParams = new URLSearchParams(window.location.search);
const postId = searchParams.get("postId");
renderPost(postId).then(setupUI);

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
