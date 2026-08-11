const fs = require('fs');

const PLACE_ID = 'ChIJs-V4djYZqwcR5TOWq4ytczg';
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function main() {
  const res = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=pt-BR`, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'reviews,rating,userRatingCount'
    }
  });

  if (!res.ok) {
    throw new Error(`Erro na API do Google: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();

  const reviews = (data.reviews || [])
    .filter(r => r.rating >= 4)
    .map(r => ({
      author: r.authorAttribution?.displayName || 'Paciente',
      rating: r.rating,
      text: r.text?.text || r.originalText?.text || '',
      relativeTime: r.relativePublishTimeDescription || ''
    }));

  const output = {
    updatedAt: new Date().toISOString(),
    overallRating: data.rating || null,
    totalReviews: data.userRatingCount || null,
    reviews
  };

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/reviews.json', JSON.stringify(output, null, 2));
  console.log(`Salvas ${reviews.length} avaliações de 4-5 estrelas (de ${data.reviews?.length || 0} retornadas pela API).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});