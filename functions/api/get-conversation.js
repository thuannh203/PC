export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const page_id = url.searchParams.get('page_id');
    const conversation_id = url.searchParams.get('conversation_id');

    if (!page_id || !conversation_id) {
      return new Response(JSON.stringify({ message: 'Thiếu page_id hoặc conversation_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const PAGE_ACCESS_TOKEN = env.PAGE_ACCESS_TOKEN;

    // Gọi API list conversations, dùng conversation_id làm last_conversation_id
    const apiUrl = `https://pages.fm/api/public_api/v2/pages/${page_id}/conversations/${conversation_id}/messages?page_access_token=${PAGE_ACCESS_TOKEN}`;

    const res = await fetch(apiUrl, {
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