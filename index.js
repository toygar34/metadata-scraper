const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/scrape", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: "url parametresi eksik" });

  try {
    const { data } = await axios.get(targetUrl);
    const $ = cheerio.load(data);

    const title = $("meta[property='og:title']").attr("content") || $("title").text();
    const description = $("meta[property='og:description']").attr("content") || $("meta[name='description']").attr("content");
    const image = $("meta[property='og:image']").attr("content");

    // DİL ALGILAMA (HTML tag ve meta)
    let lang =
      $("html").attr("lang") ||
      $("meta[http-equiv='content-language']").attr("content") ||
      $("meta[name='language']").attr("content") ||
      null;

    // Eğer dil kodu varsa (ör: "tr-TR") bunu sadece 2 harfe indir:
    if (lang && lang.length > 2) lang = lang.slice(0, 2).toLowerCase();

    return res.json({
      title: title || null,
      description: description || null,
      image: image || null,
      sourceSite: new URL(targetUrl).hostname,
      lang: lang || null // dil tespit sonucu eklendi!
    });
  } catch (err) {
    return res.status(500).json({ error: "Scrape hatası", detail: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Metadata scraper ${PORT} portunda çalışıyor`);
});
