export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { page_id, page_customer_id, name, phone, gender, birthday } = body;

    if (!page_id || !page_customer_id) {
      return new Response(JSON.stringify({ message: 'Thiếu page_id hoặc page_customer_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const PAGE_ACCESS_TOKEN = env.PAGE_ACCESS_TOKEN;

    const changes = {};
    if (name) changes.name = name;
    if (gender) changes.gender = gender;
    if (birthday) changes.birthday = birthday;
    if (phone) changes.phone_numbers = [phone];

    // Nếu không có field nào để update thì báo lỗi
    if (Object.keys(changes).length === 0) {
      return new Response(JSON.stringify({ message: 'Không có thông tin nào để cập nhật' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = `https://pages.fm/api/public_api/v1/pages/${page_id}/page_customers/${page_customer_id}?page_access_token=${PAGE_ACCESS_TOKEN}`;

    const pancakeRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ changes })
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