const GRADIENTS = {
  "Action":      "linear-gradient(135deg, #7f0000 0%, #b71c1c 50%, #e65100 100%)",
  "Drama":       "linear-gradient(135deg, #1a237e 0%, #283593 50%, #4527a0 100%)",
  "Sci-Fi":      "linear-gradient(135deg, #006064 0%, #01579b 50%, #0d47a1 100%)",
  "Horror":      "linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #212121 100%)",
  "Comedy":      "linear-gradient(135deg, #e65100 0%, #f57f17 50%, #ff8f00 100%)",
  "Romance":     "linear-gradient(135deg, #880e4f 0%, #ad1457 50%, #6a1b9a 100%)",
  "Mystery":     "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #004d40 100%)",
  "Thriller":    "linear-gradient(135deg, #212121 0%, #263238 50%, #37474f 100%)",
  "Animation":   "linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #4527a0 100%)",
  "Fantasy":     "linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #006064 100%)",
  "Crime":       "linear-gradient(135deg, #3e2723 0%, #4e342e 50%, #212121 100%)",
  "Documentary": "linear-gradient(135deg, #33691e 0%, #1b5e20 50%, #006064 100%)",
};

const DEFAULT = "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";

export function genreGradient(genre) {
  if (!genre) return DEFAULT;
  const key = Object.keys(GRADIENTS).find(k => genre.toLowerCase().includes(k.toLowerCase()));
  return key ? GRADIENTS[key] : DEFAULT;
}
