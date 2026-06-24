export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    try {
      const url = new URL(request.url);
      const jiraDomain = url.searchParams.get('domain');
      const jiraPath = url.searchParams.get('path');

      if (!jiraDomain || !jiraPath) {
        return new Response(JSON.stringify({ error: 'Missing domain or path param' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin }
        });
      }

      const jiraUrl = `https://${jiraDomain}${jiraPath}`;

      const jiraRes = await fetch(jiraUrl, {
        method: 'GET',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      const body = await jiraRes.text();
      return new Response(body, {
        status: jiraRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
        }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin }
      });
    }
  }
};
