export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { page_id, page_customer_id, phone } = body;

    if (!page_id || !page_customer_id || !phone) {
      return new Response(JSON.stringify({ message: 'Thiếu thông tin bắt buộc' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const PAGE_ACCESS_TOKEN = env.PAGE_ACCESS_TOKEN;

    const url = `https://pages.fm/api/public_api/v1/pages/${page_id}/page_customers/${page_customer_id}?page_access_token=${PAGE_ACCESS_TOKEN}`;

    const pancakeRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        changes: {
          phone_numbers: [phone]
        }
      })
    });

    const data = await pancakeRes.json();

    return new Response(JSON.stringify(data), {
      status: pancakeRes.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
