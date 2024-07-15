
function switching (unit) {
  var factor = 0;
  var check = "";
  switch (unit) {
  case "0C06": 
    factor = 1000;
        check = "0C06, MWh 3";
    break;
  case "0C07": 
    factor = 100;
          check = "0C07, MWh 2";
    break;
  case "0C08": 
    factor = 10;
    check = "0C08, MWh 1";
    break;
  case "0C0E":
        factor: 3600;
    check = "0C0E, GJ 3";
  case "0C0F":
        factor: 360; 
        check = "0C0E, GJ 2";
      case "0CFB00": 
    factor = 10;
        check = "0CFB00, MWh 1";
    break;
      case "0CFB01": 
    factor = 1;
        check = "0CFB01, MWh 0";
    break;
      case "0CFB08": 
    factor = 36;
        check = "0C0E, GJ 1";
    break;
      case "0CFB09": 
    factor = 3.6;
        check = "0CFB09, GJ 0";
    break;
  case "0C14":
    factor =  100;
    break;
  case "0C15":
    factor =  10;
    break;
  case "0C16":
    factor = 1;
    break;
  case "0B2B":
    factor = 1000;
    break;
  case "0B2C":
    factor = 100;
    break;
  case "0B2D":
    factor = 10;
    break;
  case "0B2E":
    factor = 1;
    break;
  case "0B3B":
    factor = 1000;
    break;
  case "0B3C":
    factor = 100;
    break;
  case "0B3D":
    factor = 10;
    break;
  case "0B3E":
    factor = 1;
    break;
  case "0A5A":
    factor = 10;
    break;
  case "0A5B":
    factor = 1;
    break;
  case "0A5E":
    factor = 10;
    break;
  case "0A5F":
    factor = 1;
    break;
  case "4C06":
      factor = 1000;
      break;
  case "4C07":
    factor = 100;
      break;
  case "4C08":
    factor = 10;
      break;  
  case "4CFB":
    factor = 1;
      break;
      break;
  }
  return [factor,check];
}

function reverse(payload){
  const reversed = parseInt(payload.match(/(..?)/g).reverse().join(""));
  return reversed
}

function reverseString(payload){
  const reversed = payload.match(/(..?)/g).reverse().join("");
  return reversed
}

function bdc2dec(payload) {
const digits = payload.match(/(..?)/g).reverse().join("");
const decimals = [];
for (idx in digits) {
  decimals.push(parseInt(digits[idx], 16));
}
return decimals.join("");
}

// Standard
function parseStandard(payload) {

var energyValueTransformed = -1;
var energyCheck = "";
var switchResult = [];
const energyValueRaw = reverse(payload.slice(6,14));
if (payload.slice(2,6) == "0CFB"){
    switchResult = switching(payload.slice(2,8));
    energyValueTransformed = energyValueRaw / switchResult[0];
    energyCheck = switchResult[1];
}
else {
    switchResult = switching(payload.slice(2,6));
    energyValueTransformed = energyValueRaw / switchResult[0];
    energyCheck = switchResult[1];
}
var energyValidation =energyValueRaw == parseInt( 10**parseInt(energyCheck.split(' ')[2]) * energyValueTransformed );


  var volumeValueTransformed = -1;
const volumeValueRaw = reverse(payload.slice(18,26));
volumeValueTransformed = volumeValueRaw / switching(payload.slice(14,18))[0];


  var powerValueTransformed = -1;
const powerValueRaw = reverse(payload.slice(30,36));
powerValueTransformed = powerValueRaw / switching(payload.slice(26,30))[0];

const powerBDC_JD = bdc2dec(payload.slice(30,36)) / switching(payload.slice(26,30))[0];

  var flowValueTransformed = -1;
const flowValueRaw = reverse(payload.slice(40,46));
flowValueTransformed = flowValueRaw / switching(payload.slice(36,40))[0];

const flowBDC_JD = bdc2dec(payload.slice(40,46)) / switching(payload.slice(36,40))[0];

  var fwTempValueTransformed = -1;
const fwTempValueRaw = reverse(payload.slice(50,54));
fwTempValueTransformed = fwTempValueRaw / switching(payload.slice(46,50))[0];

var rtTempValueTransformed = -1;
const rtTempValueRaw = reverse(payload.slice(58,62));
rtTempValueTransformed = rtTempValueRaw / switching(payload.slice(54,58))[0];
  
const meterIDValue = reverseString(payload.slice(66,74));

const errorBitsValue = reverse(payload.slice(80,84));

return {
  energy_MWh: energyValueTransformed,
  energy: energyValueRaw,
  energyCheck:energyCheck,
  volume_m3: volumeValueTransformed,
  volume: volumeValueRaw,
  power_kw: powerValueTransformed,
  power: powerValueRaw,
  flow_m3h: flowValueTransformed,
  flow: flowValueRaw,
  rttemp_c: rtTempValueTransformed,
  rttemp: rtTempValueRaw,
  fwtemp_c: fwTempValueTransformed,
  fwtemp: fwTempValueRaw,
  meter_id: meterIDValue,
  errors: errorBitsValue,
  energyValidation:energyValidation,
  powerValueRaw: payload.slice(30,36),
  power_kw_jd: powerBDC_JD,
  flow_m3h_jd: flowBDC_JD
};
}

function parseCompact(payload) {

var energyValueTransformed = -1;
const energyValueRaw = reverse(payload.slice(6,14));
energyValueTransformed = energyValueRaw / switching(payload.slice(2,6))[0];

var energyCheck =  switching(payload.slice(2,6))[1];
var energyValidation =energyValueRaw == parseInt( 10**parseInt(energyCheck.split(' ')[2]) * energyValueTransformed );

  const meterIDValue = reverseString(payload.slice(18,26));
  const errorBitsValue = reverse(payload.slice(56,60));
  return {
    energy: energyValueRaw,
    energy_MWh: energyValueTransformed,
  energyValidation:energyValidation,
    meter_id: meterIDValue,
    errors: errorBitsValue,
    energyCheck:energyCheck
  };
}
function parseScheduledDailyRedundant(payload) {

var energyValueTransformed = -1;
const energyValueRaw = reverse(payload.slice(6,14));
energyValueTransformed = energyValueRaw / switching(payload.slice(2,6))[0];
const meterIDValue = reverse(payload.slice(18,26)).toString();
const errorBitsValue = reverseString(payload.slice(32,36));

  const meterDateTimeValue = reverse(payload.slice(30,38)).toString(2);

  const minute = parseInt(meterDateTimeValue.slice(0, 6));
  const reserved = parseInt(meterDateTimeValue.slice(6, 7));
  const errorFlag = parseInt(meterDateTimeValue.slice(7, 8));
  const hour = parseInt(meterDateTimeValue.slice(8, 13));
  const century = parseInt(meterDateTimeValue.slice(13, 15));
  const summertimeFlag = parseInt(meterDateTimeValue.slice(15, 16));
  const day = parseInt(meterDateTimeValue.slice(16, 21));
  const yearLow = parseInt(meterDateTimeValue.slice(21, 24));
  const month = parseInt(meterDateTimeValue.slice(24, 28));
  const yearHigh = parseInt(meterDateTimeValue.slice(28, 32));

  const year = yearHigh << 4 | yearLow;
  
  var accumulatedEnergyAt24ValueTransformed = -1;
  const accumulatedEnergyAt24ValueRaw = reverse(payload.slice(42,50));
  accumulatedEnergyAt24ValueTransformed = accumulatedEnergyAt24ValueRaw /switching(payload.slice(38,42))[0];
  
  return {
    energy: energyValueRaw,
    energy_MWh: energyValueTransformed,
    volume_m3: volumeValueTransformed,
    volume: volumeValueRaw,
    meter_id: meterIDValue,
    errors: errorBitsValue,
    century: century,
    year: year,
    month: month,
    day: day,
    hour: hour,
    minute: minute,
    summertimeFlag: summertimeFlag,
    errorFlag: errorFlag,
    reserved: reserved,
    accumulatedEnergy: accumulatedEnergyAt24ValueRaw,
    accumulatedEnergy_: accumulatedEnergyAt24ValueTransformed
  };
}


module.exports = function (payload, meta) {
const msgType = payload.slice(0,2);
let result = { error: 'Unknown message type. Please check parser.' };
if (msgType == "00") {
  result = parseStandard(payload);
  result["payload_style"] = 0;
} else if (msgType == "01") {
      result = parseCompact(payload);
      result["payload_style"] = 1;

  } else if (msgType == "02") {
      result = parseJSON(payload);
      result["payload_style"] =2;

  } else if (msgType == "03") {
      result = parseScheduledDailyRedundant(payload);
      result["payload_style"] = 3;

  }
return result;
}