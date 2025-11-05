import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

// ✅ 修正版：允許 GitHub Pages 呼叫你的 API
app.use(cors({
  origin: [
    "https://tom-omega.github.io", // GitHub Pages 網址
    "https://carrot-bot.onrender.com" // 自身伺服器允許自取
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

// === 你的 Discord 資訊 ===
const CLIENT_ID = "1421159483995979796";
const CLIENT_SECRET = "⚠️ 這裡等一下你要自己填入 Bot 的 client secret";
const GUILD_ID = "1420254884581867642";
const REDIRECT_URI = "https://你的vercel網址.vercel.app/api/callback";

// Discord OAuth 登入連結
app.get("/api/login", (req, res) => {
  const url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify+guilds.join`;
  res.redirect(url);
});

// OAuth 回呼
app.get("/api/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // 取得 access_token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // 取得使用者資料
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = userRes.data;

    // 檢查是否在伺服器中
    const guildRes = await axios.get("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const joinedGuild = guildRes.data.find((g) => g.id === GUILD_ID);

    if (joinedGuild) {
      // 驗證成功 → 回前端 ?joined=true
      res.redirect("/?joined=true");
    } else {
      res.send("⚠️ 你還沒有加入伺服器，請先掃 QRCode 加入。");
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send("登入失敗，請重新嘗試。");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
