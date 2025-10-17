export const fetchPosts = async () => {
  const res = await fetch("https://texhpulze.onrender.com/api/posts");
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};
