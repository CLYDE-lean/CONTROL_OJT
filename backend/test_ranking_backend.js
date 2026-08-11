const ojtMetricsService = require('./src/services/ojtMetricsService');

async function test() {
  try {
    const res = await ojtMetricsService.getRankingFormadores({});
    console.log('RESULTADO RANKING FORMADORES:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('ERROR EN TEST:', e);
  }
}

test();
