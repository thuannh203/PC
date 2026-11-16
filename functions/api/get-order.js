export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const shop_id = url.searchParams.get('shop_id');
    const order_id = url.searchParams.get('order_id');

    console.log('[get-order] Query:', { shop_id, order_id });

    if (!shop_id || !order_id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Thiếu shop_id hoặc order_id'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const API_KEY = env.POS_API_KEY;
    if (!API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Chưa cấu hình POS_API_KEY'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiUrl = `https://pos.pages.fm/api/v1/shops/${shop_id}/orders/${order_id}?api_key=${API_KEY}`;
    console.log('[get-order] Calling POS API:', apiUrl.replace(API_KEY, '***'));

    const res = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json();
    console.log('[get-order] Status:', res.status);
    console.log('[get-order] total_price:', data?.total_price, '| cod:', data?.cod);

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.log('[get-order] Exception:', err.message);
    return new Response(JSON.stringify({
      success: false,
      message: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}