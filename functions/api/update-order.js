export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { shop_id, order_id, page_id, conversation_id } = body;

    // Validate
    if (!shop_id || !order_id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Thiếu shop_id hoặc order_id'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!page_id && !conversation_id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Cần ít nhất page_id hoặc conversation_id để cập nhật'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const API_KEY = env.POS_API_KEY; // Lưu API key trong Cloudflare env

    if (!API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Chưa cấu hình POS_API_KEY'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Body chỉ gửi các field cần cập nhật
    const updateBody = {};
    if (page_id) updateBody.page_id = page_id;
    if (conversation_id) updateBody.conversation_id = conversation_id;

    const apiUrl = `https://pos.pages.fm/api/v1/shops/${shop_id}/orders/${order_id}?api_key=${API_KEY}`;

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateBody)
    });

    const data = await res.json();

    // Pancake thường trả success: true/false
    if (!res.ok || data.success === false) {
      return new Response(JSON.stringify({
        success: false,
        message: data.message || data.error || 'Cập nhật đơn hàng thất bại',
        data
      }), {
        status: res.status || 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Cập nhật page_id / conversation_id thành công',
      data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      message: err.message || 'Lỗi server'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}