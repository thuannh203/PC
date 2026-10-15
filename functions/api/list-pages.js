export async function onRequestGet(context) {
  const { env } = context;

  try {
    const ACCESS_TOKEN = env.ACCESS_TOKEN; // User Access Token

    const res = await fetch(`https://pages.fm/api/v1/pages?access_token=${ACCESS_TOKEN}`, {
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}