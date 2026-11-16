export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { shop_id, order_id, page_id, conversation_id } = body;

    console.log('[update-order] Request body:', JSON.stringify(body));

    if (!shop_id || !order_id) {
      console.log('[update-order] Missing shop_id or order_id');
      return new Response(JSON.stringify({
        success: false,
        message: 'Thiếu shop_id hoặc order_id'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!page_id && !conversation_id) {
      console.log('[update-order] Missing page_id and conversation_id');
      return new Response(JSON.stringify({
        success: false,
        message: 'Cần ít nhất page_id hoặc conversation_id để cập nhật'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const API_KEY = env.POS_API_KEY;

    if (!API_KEY) {
      console.log('[update-order] POS_API_KEY is not set');
      return new Response(JSON.stringify({
        success: false,
        message: 'Chưa cấu hình POS_API_KEY'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateBody = {};
    if (page_id) updateBody.page_id = page_id;
    if (conversation_id) updateBody.conversation_id = conversation_id;

    const apiUrl = `https://pos.pages.fm/api/v1/shops/${shop_id}/orders/${order_id}?api_key=${API_KEY}`;

    console.log('[update-order] Calling POS API:', apiUrl.replace(API_KEY, '***'));
    console.log('[update-order] Update body:', JSON.stringify(updateBody));

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateBody)
    });

    const data = await res.json();

    console.log('[update-order] POS response status:', res.status);
    console.log('[update-order] POS response body:', JSON.stringify(data));

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
      data: data.data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.log('[update-order] Exception:', err.message, err.stack);
    return new Response(JSON.stringify({
      success: false,
      message: err.message || 'Lỗi server'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}