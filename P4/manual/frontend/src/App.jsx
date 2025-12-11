import { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000/api";

function App() {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [articles, setArticles] = useState([]);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const res = await fetch(`${API_BASE}/articles`);
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setMessage("");

    if (!username || !password) {
      setMessage("Please enter username and password.");
      return;
    }

    try {
      if (mode === "register") {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage(data.error || "Register failed");
          return;
        }
        setMessage("Registered. Now log in.");
        setMode("login");
        return;
      } else {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage(data.error || "Login failed");
          return;
        }
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          setMessage("Logged in.");
        } else {
          setMessage("No token returned.");
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    }
  }

  async function handleCreateArticle(e) {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("You must be logged in to post.");
      return;
    }
    if (!newUrl) {
      setMessage("URL is required.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url: newUrl, title: newTitle })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to create article");
        return;
      }
      setArticles((prev) => [data, ...prev]);
      setNewUrl("");
      setNewTitle("");
      setMessage("Article posted.");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    }
  }

  async function handleDeleteArticle(id) {
    if (!token) {
      setMessage("You must be logged in to delete.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to delete");
        return;
      }
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    }
  }

  function handleLogout() {
    setToken("");
    localStorage.removeItem("token");
    setMessage("Logged out.");
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h1>Article Share (Manual)</h1>

      {message && (
        <div style={{ marginBottom: 12, color: "darkred" }}>{message}</div>
      )}

      {/* Auth block */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 12,
          marginBottom: 16
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{ marginRight: 8 }}
          >
            Login
          </button>
          <button type="button" onClick={() => setMode("register")}>
            Register
          </button>
        </div>

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit">
            {mode === "login" ? "Login" : "Register"}
          </button>
          {token && (
            <button
              type="button"
              onClick={handleLogout}
              style={{ marginLeft: 8 }}
            >
              Logout
            </button>
          )}
        </form>
      </div>

      {/* New article form (only useful if logged in, but we won't overthink it) */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 12,
          marginBottom: 16
        }}
      >
        <h2>Post a new article</h2>
        <form onSubmit={handleCreateArticle}>
          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="https://example.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="optional title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit">Post</button>
        </form>
      </div>

      {/* Articles list */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 12
        }}
      >
        <h2>Articles</h2>
        {articles.length === 0 && <p>No articles yet.</p>}
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {articles.map((a) => (
            <li
              key={a.id}
              style={{
                borderBottom: "1px solid #eee",
                padding: "8px 0"
              }}
            >
              <div>
                <a href={a.url} target="_blank" rel="noreferrer">
                  {a.title || a.url}
                </a>
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                posted by {a.username} at{" "}
                {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
              </div>
              {token && (
                <button
                  type="button"
                  onClick={() => handleDeleteArticle(a.id)}
                  style={{ marginTop: 4 }}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
