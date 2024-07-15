function readInt8BE(payload, idx) {
  const p = payload.slice(idx || 0);
  return p[0] << 0;
}
  
function readInt16BE(payload, idx) {
  const p = payload.slice(idx || 0);
  return p[1] << 8 | p[0] << 0;
}
  
function readInt16LE(payload, idx) {
  const p = payload.slice(idx || 0);
  return p[0] << 8 | p[1] << 0;
}
  
function readInt24BE(payload, idx) {
  const p = payload.slice(idx || 0);
  return p[2] << 16 | p[1] << 8 | p[0] << 0;
}
  
function readInt32BE(payload, idx) {
  const p = payload.slice(idx || 0);
  return p[3] << 24 | p[2] << 16 | p[1] << 8 | p[0] << 0;
}

function readInt32LE(payload, idx) {
  const p = payload.slice(idx || 0);
  return p[0] << 24 | p[1] << 16 | p[2] << 8 | p[3] << 0;
}
  
function switching (unit) {
    var factor = 0;
    // We have to swap the endianess, since due to MODBUS it's actually BigEndian and we check in the switching part with LittleEndian.
    var unitSwapped = ((unit & 0xFF) << 8 | (unit >> 8) & 0xFF);
    switch (unitSwapped) {
      case 0x0403:
        factor = Math.pow(10, 6);
        break;
      case 0x0404:
        factor = Math.pow(10, 5);
        break;
      case 0x0405:
        factor = Math.pow(10, 4);
        break;
  
      case 0x0406:
      case 0x0413:
      case 0x022B:
      case 0x023B:
      case 0x0258:
      case 0x025C:
        factor = (Math.pow(10, 3));
        break;
  
      case 0x0407:
      case 0x0414:
      case 0x022C:
      case 0x023C:
      case 0x0259:
      case 0x025D:
        factor = (Math.pow(10, 2));
        break;
  
      case 0x0415:
      case 0x022D:
      case 0x023D:
      case 0x025A:
      case 0x025E:
        factor = Math.pow(10, 1);
        break;
  
      case 0x0416:
      case 0x022E:
      case 0x023E:
      case 0x025B:
      case 0x025F:
        factor = 1;
        break;
  
      case 0x0417:
      case 0x022F:
      case 0x023F:
        factor = 0.1;
        break;
  
      case 0x040E:
        factor = 3600;
        break;
        
      case 0x040F:
        factor = 360;
        break;
    }
    return factor;
}

function twosComplement(value,bitcount)
{
    if ((value & (1<<(bitcount-1))) > 0) {
       value = value - (1<<(bitcount));
    }
    return value;
}

// Standard
function parseStandard(payload) {
  const messageFormatIdentifier = payload[0];
  
  var energyValueTransformed = -1;
  const energyValueRaw = readInt32BE(payload, 3);
  energyValueTransformed = energyValueRaw / switching(readInt16BE(payload, 1));

  var volumeValueTransformed = -1;
  const volumeValueRaw = readInt32BE(payload, 9);
  volumeValueTransformed = volumeValueRaw / switching(readInt16BE(payload, 7));

  var powerValueTransformed = -1;
  const powerValueRaw = readInt16BE(payload, 15);
  powerValueTransformed = powerValueRaw / switching(readInt16BE(payload, 13));

  var flowValueTransformed = -1;
  const flowValueRaw = twosComplement(readInt16BE(payload, 19),16);
  flowValueTransformed = flowValueRaw / switching(readInt16BE(payload, 17));

  var fwTempValueTransformed = -1;
  const fwTempValueRaw = readInt16BE(payload, 23);
  fwTempValueTransformed = fwTempValueRaw / switching(readInt16BE(payload, 21));

  var rtTempValueTransformed = -1;
  const rtTempValueRaw = readInt16BE(payload, 27);
  rtTempValueTransformed = rtTempValueRaw / switching(readInt16BE(payload, 25));

  const meterIDKey = readInt16BE(payload, 29);
  const meterIDValue = readInt32BE(payload, 31).toString(16);

  const errorBits = readInt24BE(payload, 35);
  const errorBitsValue = readInt32BE(payload, 38);

  return {
    volume_m3: volumeValueTransformed,
    volume: volumeValueRaw,
    rttemp_c: rtTempValueTransformed,
    rttemp: rtTempValueRaw,
    power_kw: powerValueTransformed,
    power: powerValueRaw,
    payload_style: messageFormatIdentifier,
    meter_id: meterIDValue,
    fwtemp_c: fwTempValueTransformed,
    fwtemp: fwTempValueRaw,
    flow_m3h: flowValueTransformed,
    flow: flowValueRaw,
    errors: errorBitsValue,
    energy_MWh: energyValueTransformed,
    energy: energyValueRaw
  };
}

function parseCompact(payload) {
    const messageFormatIdentifier = payload[0];
    
    var energyValueTransformed = -1;
    const energyValueRaw = readUInt32BE(payload, 3);
    energyValueTransformed = energyValueRaw / switching(readInt16BE(payload, 1));
    
    const meterIDKey = readInt16BE(payload, 7);
    const meterIDValue = readInt32BE(payload, 9).toString(16);
  
    const errorBitsKey = readInt24BE(payload, 13);
    const errorBitsValue = readInt32BE(payload, 16);
    
    return {
      energy: energyValueRaw,
      energy_MWh: energyValueTransformed,
      meter_id: meterIDValue,
      errors: errorBitsValue
    };
}
  
  function parseJSON(payload) {
    const msgFormatIdentifier = payload[0];
    var result = "";
    for (var i = 1; i < payload.length; i++) {
        result += String.fromCharCode("0x" + payload[i]);
    }
    return {
        result: result
    };
  }
  
function parseScheduledDailyRedundant(payload) {
    const msgFormatIdentifier = payload[0];
  
    var energyValueTransformed = -1;
    const energyValueRaw = readInt32BE(payload, 3);
    energyValueTransformed = energyValueRaw / switching(readInt16BE(payload, 1));
    
    var volumeValueTransformed = -1;
    const volumeValueRaw = readInt32BE(payload, 9);
    volumeValueTransformed = volumeValueRaw / switching(readInt16BE(payload, 7));
    
    const meterIDKey = readInt16BE(payload, 13);
    const meterIDValue = readInt32BE(payload, 15).toString(16);
  
    const errorBitsKey = readInt24BE(payload, 19);
    const errorBitsValue = readInt32BE(payload, 22);
    
    const meterDateTimeKey = readInt16BE(payload, 26);
    const meterDateTimeValue = readInt32BE(payload, 28).toString(2);
  
    // Array.prototyp.slice(start, [end]) with end not included
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
    const accumulatedEnergyAt24ValueRaw = readUInt32BE(payload, 34);
    accumulatedEnergyAt24ValueTransformed = accumulatedEnergyAt24ValueRaw / switching(readInt16BE(payload, 32));
    
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
  
function parseScheduledExtended(payload) {
    const msgFormatIdentifier = payload[0];
    
    var energyValueTransformed = -1;
    const energyValueRaw = readInt32BE(payload, 3);
    energyValueTransformed = energyValueRaw / switching(readInt16BE(payload, 1));
    
    var volumeValueTransformed = -1;
    const volumeValueRaw = readInt32BE(payload, 9);
    volumeValueTransformed = volumeValueRaw / switching(readInt16BE(payload, 7));
    
    const powerFlowDIFDIV = readInt24BE(payload, 13);
    const powerFlowScaling = readInt8BE(payload, 16);
    const powerFlowScalingBinary = powerFlowScalingRaw.toString(2);
    
    const m = parseInt(powerFlowScalingFactorBinary.slice(0, 3));
    const n = parseInt(powerFlowScalingFactorBinary.slice(4, 7));
    
    const powerScalingFactor = Math.pow(10, (n - 7));
    const flowScalingFactor = Math.pow(10, (m - 7));
    
    var fwTempValueTransformed = -1;
    const fwTempValueRaw = readInt16LE(payload, 17);
    fwTempValueTransformed = fwTempValueRaw;
    
    var rtTempValueTransformed = -1;
    const rtTempValueRaw = readInt16LE(payload, 19);
    rtTempValueTransformed = rtTempValueRaw;
    
    const flowValueRaw = readInt16BE(payload, 21);
    const flowValueTransformed = flowValueRaw / flowScalingFactor;
    
    const powerValueRaw = readInt16(payload, 23);
    const powerValueTransformed = (powerValueRaw / powerScalingFactor) * Math.pow(10, 3);
    
    const meterIDDIFVIF = readInt24BE(payload, 25);
    const errorBitsValue = readInt16LE(payload, 28);
    const meterIDValue = readInt32LE(payload, 30).toString(16);
  
    const meterDateTimeKey = readInt16BE(payload, 34);
    const meterDateTimeValue = readInt32BE(payload, 35).toString(2);
    
    // Array.prototyp.slice(start, [end]) with end not included
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
    
    return {
      energy: energyValueRaw,
      energy_MWh: energyValueTransformed,
      volume_m3: volumeValueTransformed,
      volume: volumeValueRaw,
      rttemp_c: rtTempValueTransformed,
      rttemp: rtTempValueRaw,
      fwtemp_c: fwTempValueTransformed,
      fwtemp: fwTempValueRaw,
      flow_m3h: flowValueTransformed,
      flow: flowValueRaw,
      power_kw: powerValueTransformed,
      power: powerValueRaw,
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
      reserved: reserved
    };
}
  
function parseCombinedHeatCooling(payload) {
    const msgFormatIdentifier = payload[0];
    
    var heatEnergyTransformed = -1;
    const heatEnergyRaw = readInt32BE(payload, 3);
    heatEnergyTransformed = heatEnergyRaw / switching(readInt16BE(payload, 1));
    
    var coolingEnergyTransformed = -1;
    const coolingEnergyRaw = readInt32BE(payload, 11);
    const unit = readInt32BE(payload, 7);
    const coolingEnergyUnitLE = (unit & 0xFF) << 24 | (unit >> 24) & 0xFF | (unit && 0xFF) << 16 | (unit >> 16) & 0xFF | (unit & 0xFF) << 8 | (unit >> 8) & 0xFF;
    var factor = -1;
    switch (coolingEnergyUnitLE) {
      case 0x0483FF02: factor = Math.pow(10, 6);break;
      case 0x0484FF02: factor = Math.pow(10, 5);break;
      case 0x0485FF02: factor = Math.pow(10, 4);break;
      case 0x0486FF02: factor = Math.pow(10, 3);break;
      case 0x0487FF02: factor = Math.pow(10, 2);break;
      case 0x048EFF02: factor = 1;break;
      case 0x048FFF02: factor = 0.1;break;
    };
    coolingEnergyTransformed = coolingEnergyRaw / factor;
    
    var volumeValueTransformed = -1;
    const volumeValueRaw = readInt32BE(payload, 17);
    volumeValueTransformed = volumeValueRaw / switchingLocal(readInt16BE(payload, 15));
  
    var fwTempValueTransformed = -1;
    const fwTempValueRaw = readInt16BE(payload, 23);
    fwTempValueTransformed = fwTempValueRaw / switchingLocal(readInt16BE(payload, 21));
  
    var rtTempValueTransformed = -1;
    const rtTempValueRaw = readInt16BE(payload, 27);
    rtTempValueTransformed = rtTempValueRaw / switchingLocal(readInt16BE(payload, 25));
    
    const meterIDKey = readInt16BE(payload, 29);
    const meterIDValue = readInt32BE(payload, 31).toString(16);
  
    const errorBitsKey = readInt24BE(payload, 35);
    const errorBitsValue = readInt16BE(payload, 38);
    
    return {
      heatEnergy: heatEnergyRaw,
      heatEnergyTransformed: heatEnergyTransformed,
      coolingEnergy: coolingEnergyRaw,
      coolingEnergyTransformed: coolingEnergyTransformed,
      volume: volumeValueRaw,
      volume_m3: volumeValueTransformed,
      fwtemp: fwTempValueRaw,
      fwtemp_c: fwTempValueTransformed,
      rttemp: rtTempValueRaw,
      rttemp_c: rtTempValueTransformed,
      meter_id: meterIDValue,
      errors: errorBitsValue
    };
}


function simpleBilling(payload) {
    const msgFormatIdentifier = payload[0];

    var energyValueTransformed = -1;
    const energyValueRaw = readInt32BE(payload, 3);
    energyValueTransformed = energyValueRaw / switching(readInt16BE(payload, 1));
    
    var volumeValueTransformed = -1;
    const volumeValueRaw = readInt32BE(payload, 9);
    volumeValueTransformed = volumeValueRaw / switching(readInt16BE(payload, 7));

    const meterIDKey = readInt16BE(payload, 13);
    const meterIDValue = readInt32BE(payload, 15).toString(16);

    const errorBitsKey = readInt24(payload, 19);
    const errorBitsValue = readInt32(payload, 22);

    var energyInWrongMountingPositionTransformed = -1;
    const energyInWrongMountingPositionRaw = readInt32BE(payload, 30);
    const unit = readInt32BE(payload, 26);
    const energyInWrongMountingPositionUnitLE = (unit & 0xFF) << 24 | (unit >> 24) & 0xFF | (unit && 0xFF) << 16 | (unit >> 16) & 0xFF | (unit & 0xFF) << 8 | (unit >> 8) & 0xFF;
    var factor = -1;
    switch (energyInWrongMountingPositionUnitLE) {
      case 0x0483FF03: factor = Math.pow(10, 6);break;
      case 0x0484FF03: factor = Math.pow(10, 5);break;
      case 0x0485FF03: factor = Math.pow(10, 4);break;
      case 0x0486FF03: factor = Math.pow(10, 3);break;
      case 0x0487FF03: factor = Math.pow(10, 2);break;
      case 0x048EFF03: factor = 1;break;
      case 0x048FFF03: factor = 0.1;break;
    };
    energyInWrongMountingPositionTransformed = energyInWrongMountingPositionRaw / factor;

    var previousMonthEnergyTransformed = -1;
    const previousMonthEnergyRaw = readInt32(payload, 37);
    const unit = readInt24(payload, 34);
    const previousMonthEnergyUnitLE = (unit && 0xFF) << 16 | (unit >> 16) & 0xFF | (unit & 0xFF) << 8 | (unit >> 8) & 0xFF;
    var factor = -1;
    switch (previousMonthEnergyUnitLE) {
        case 0xB40103: factor = Math.pow(10, 6);break;
        case 0xB40104: factor = Math.pow(10, 5);break;
        case 0xB40105: factor = Math.pow(10, 4);break;
        case 0xB40106: factor = Math.pow(10, 3);break;
        case 0xB40107: factor = Math.pow(10, 2);break;
        case 0xB4010E: factor = 1;break;
        case 0xB4010F: factor = 0.1;break;
    };
    previousMonthEnergyTransformed = energyInWrongMountingPositionRaw / factor;

    return {
        payload_style: msgFormatIdentifier,
        volume: volumeValueRaw,
        volume_m3: volumeValueTransformed,
        energy: energyValueRaw,
        energy_MWh: energyValueTransformed,
        meter_id: meterIDValue,
        errors: errorBitsValue,
        energy_wrong_mounting_position: energyInWrongMountingPositionRaw,
        energy_wrong_mounting_position_MWh: energyInWrongMountingPositionTransformed,
        previous_month_energy: previousMonthEnergyRaw,
        previous_month_energy_MWh: previousMonthEnergyTransformed
    };
}

function plausibilityCheck(payload) {
    const msgFormatIdentifier = payload[0];

    var energyValueTransformed = -1;
    const energyValueRaw = readInt32BE(payload, 3);
    energyValueTransformed = energyValueRaw / switching(readInt16BE(payload, 1));

    const meterIDKey = readInt16BE(payload, 7);
    const meterIDValue = readInt32BE(payload, 9).toString(16);

    const errorBitsKey = readInt24(payload, 13);
    const errorBitsValue = readInt32(payload, 17);

    var energyInWrongMountingPositionTransformed = -1;
    const energyInWrongMountingPositionRaw = readInt32BE(payload, 24);
    const unit = readInt32BE(payload, 20);
    const energyInWrongMountingPositionUnitLE = (unit & 0xFF) << 24 | (unit >> 24) & 0xFF | (unit && 0xFF) << 16 | (unit >> 16) & 0xFF | (unit & 0xFF) << 8 | (unit >> 8) & 0xFF;
    var factor = -1;
    switch (energyInWrongMountingPositionUnitLE) {
      case 0x0483FF03: factor = Math.pow(10, 6);break;
      case 0x0484FF03: factor = Math.pow(10, 5);break;
      case 0x0485FF03: factor = Math.pow(10, 4);break;
      case 0x0486FF03: factor = Math.pow(10, 3);break;
      case 0x0487FF03: factor = Math.pow(10, 2);break;
      case 0x048EFF03: factor = 1;break;
      case 0x048FFF03: factor = 0.1;break;
    };
    energyInWrongMountingPositionTransformed = energyInWrongMountingPositionRaw / factor;

    const missingTimeValueRaw = readInt16BE(payload, 30);
    const unit = readInt16BE(payload, 28);
    const missingTimeUnitLE = (unit && 0xFF) << 16 | (unit >> 16) & 0xFF | (unit & 0xFF) << 8 | (unit >> 8) & 0xFF;
    var factor = -1;

    switch (missingTimeUnitLE) {
        case 0x3420: factor = 1; break;
        case 0x3421: factor = 60; break;
        case 0x3422: factor = 60 * 60; break;
        case 0x3423: factor = 60 * 60 * 24; break;
    }

    const missingTimeValueTransformed = missingTimeValueRaw / factor;

    const maxFWTempValueRaw = readInt16BE(payload, 34);
    const unit = readint16(payload, 32);
    const maxFWTempUnitLE = (unit && 0xFF) << 16 | (unit >> 16) & 0xFF | (unit & 0xFF) << 8 | (unit >> 8) & 0xFF;
    var factor = -1;

    switch (maxFWTempUnitLE) {
        case 0x1258: factor = Math.pow(10, 3); break;
        case 0x1259: factor = Math.pow(10, 2); break;
        case 0x125A: factor = Math.pow(10, 1); break;
        case 0x125B: factor = 1; break;
    }
    const maxFWTempValueTransformed = maxFWTempValueRaw / factor;

    const maxRTTempValueRaw = readInt16BE(payload, 38);
    const unit = readint16(payload, 36);
    const maxRTTempUnitLE = (unit && 0xFF) << 16 | (unit >> 16) & 0xFF | (unit & 0xFF) << 8 | (unit >> 8) & 0xFF;
    var factor = -1;

    switch (maxRTTempUnitLE) {
        case 0x1258: factor = Math.pow(10, 3); break;
        case 0x1259: factor = Math.pow(10, 2); break;
        case 0x125A: factor = Math.pow(10, 1); break;
        case 0x125B: factor = 1; break;
    }
    const maxRTTempValueTransformed = maxRTTempValueRaw / factor;

    return {
        payload_style: msgFormatIdentifier,
        energy: energyValueRaw,
        energy_MWh: energyValueTransformed,
        meter_id: meterIDValue,
        errors: errorBitsValue,
        energy_wrong_mounting_position: energyInWrongMountingPositionRaw,
        energy_wrong_mounting_position_MWh: energyInWrongMountingPositionTransformed,
        missing_time: missingTimeValueRaw,
        missing_time_s: missingTimeValueTransformed,
        max_fwTemp: maxFWTempValueRaw,
        max_fwTemp_c: maxFWTempValueTransformed,
        max_rtTemp: maxRTTempValueRaw,
        max_rtTemp_c: maxRTTempValueTransformed
    };
}

function monitoring(payload) {
    const messageFormatIdentifier = payload[0];
  
    var energyValueTransformed = -1;
    const energyValueRaw = readInt32BE(payload, 3);
    energyValueTransformed = energyValueRaw / switching(readInt16BE(payload, 1));
    
    var volumeValueTransformed = -1;
    const volumeValueRaw = readInt32BE(payload, 9);
    volumeValueTransformed = volumeValueRaw / switching(readInt16BE(payload, 7));
      
    var powerValueTransformed = -1;
    const powerValueRaw = readInt16BE(payload, 15);
    powerValueTransformed = powerValueRaw / switching(readInt16BE(payload, 13));
  
    var flowValueTransformed = -1;
    const flowValueRaw = readInt16BE(payload, 19);
    flowValueTransformed = flowValueRaw / switching(readInt16BE(payload, 17));
  
    var fwTempValueTransformed = -1;
    const fwTempValueRaw = readInt16BE(payload, 23);
    fwTempValueTransformed = fwTempValueRaw / switching(readInt16BE(payload, 21));
  
    var rtTempValueTransformed = -1;
    const rtTempValueRaw = readInt16BE(payload, 27);
    rtTempValueTransformed = rtTempValueRaw / switching(readInt16BE(payload, 25));
    
    const meterIDKey = readInt16BE(payload, 29);
    const meterIDValue = readInt32BE(payload, 31).toString(16);
  
    const errorBits = readInt24BE(payload, 35);
    const errorBitsValue = readInt32BE(payload, 38);

    var energyInWrongMountingPositionTransformed = -1;
    if (payload.length == 50) {
        const energyInWrongMountingPositionRaw = readInt32BE(payload, 46);
        const unit = readInt32BE(payload, 42);
        const energyInWrongMountingPositionUnitLE = (unit & 0xFF) << 24 | (unit >> 24) & 0xFF | (unit && 0xFF) << 16 | (unit >> 16) & 0xFF | (unit & 0xFF) << 8 | (unit >> 8) & 0xFF;
        var factor = -1;
        switch (energyInWrongMountingPositionUnitLE) {
          case 0x0483FF03: factor = Math.pow(10, 6);break;
          case 0x0484FF03: factor = Math.pow(10, 5);break;
          case 0x0485FF03: factor = Math.pow(10, 4);break;
          case 0x0486FF03: factor = Math.pow(10, 3);break;
          case 0x0487FF03: factor = Math.pow(10, 2);break;
          case 0x048EFF03: factor = 1;break;
          case 0x048FFF03: factor = 0.1;break;
        };
        energyInWrongMountingPositionTransformed = energyInWrongMountingPositionRaw / factor;
        
        return {
            volume_m3: volumeValueTransformed,
            volume: volumeValueRaw,
            rttemp_c: rtTempValueTransformed,
            rttemp: rtTempValueRaw,
            power_kw: powerValueTransformed,
            power: powerValueRaw,
            payload_style: messageFormatIdentifier,
            meter_id: meterIDValue,
            fwtemp_c: fwTempValueTransformed,
            fwtemp: fwTempValueRaw,
            flow_m3h: flowValueTransformed,
            flow: flowValueRaw,
            errors: errorBitsValue,
            energy_MWh: energyValueTransformed,
            energy: energyValueRaw,
            energy_wrong_mounting_position: energyInWrongMountingPositionRaw,
            energy_wrong_mounting_position_MWh: energyInWrongMountingPositionTransformed
        };

    } else if (payload.length == 51) {
        const energyInWrongMountingPositionRaw = readInt32BE(payload, 46);
        const unit = readInt32BE(payload, 42);
        const energyInWrongMountingPositionUnitLE = (unit & 0xFF) << 24 | (unit >> 24) & 0xFF | (unit && 0xFF) << 16 | (unit >> 16) & 0xFF | (unit & 0xFF) << 8 | (unit >> 8) & 0xFF;
        var factor = -1;
        switch (energyInWrongMountingPositionUnitLE) {
          case 0x04FB8DFF03: factor = 1;break;
          case 0x04FB8EFF03: factor = Math.pow(10, 1);break;
          case 0x04FB8FFF03: factor = Math.pow(10, 2);break;
        };
        energyInWrongMountingPositionTransformed = energyInWrongMountingPositionRaw / factor;
        
        return {
            volume_m3: volumeValueTransformed,
            volume: volumeValueRaw,
            rttemp_c: rtTempValueTransformed,
            rttemp: rtTempValueRaw,
            power_kw: powerValueTransformed,
            power: powerValueRaw,
            payload_style: messageFormatIdentifier,
            meter_id: meterIDValue,
            fwtemp_c: fwTempValueTransformed,
            fwtemp: fwTempValueRaw,
            flow_m3h: flowValueTransformed,
            flow: flowValueRaw,
            errors: errorBitsValue,
            energy_MWh: energyValueTransformed,
            energy: energyValueRaw,
            energy_wrong_mounting_position: energyInWrongMountingPositionRaw,
            energy_wrong_mounting_position_MCal: energyInWrongMountingPositionTransformed
        };

    } else {
        return {
            volume_m3: volumeValueTransformed,
            volume: volumeValueRaw,
            rttemp_c: rtTempValueTransformed,
            rttemp: rtTempValueRaw,
            power_kw: powerValueTransformed,
            power: powerValueRaw,
            payload_style: messageFormatIdentifier,
            meter_id: meterIDValue,
            fwtemp_c: fwTempValueTransformed,
            fwtemp: fwTempValueRaw,
            flow_m3h: flowValueTransformed,
            flow: flowValueRaw,
            errors: errorBitsValue,
            energy_MWh: energyValueTransformed,
            energy: energyValueRaw,
        };
    }
}
  
function parseClockMessage(payload) {
    const msgFormatIdentifier = payload[0];
    
    const dateTimeValidKey = readInt16BE(payload, 1);
    var dateTimeValid = -1;
    if (dateTimeValidKey == 0x046D) { dateTimeValid = 1 };
    if (dateTimeValidKey == 0x346D) { dateTimeValid = 0 };
    
    // According to MBus Type F
    const dateTimeBinary = readInt32BE(payload, 3).toString(2);
    // Array.prototyp.slice(start, [end]) with end not included
    const minute = parseInt(dateTimeBinary.slice(0, 6));
    const unused1 = parseInt(dateTimeBinary.slice(6, 7));
    const IV = parseInt(dateTimeBinary.slice(7, 8));
    const hour = parseInt(dateTimeBinary.slice(8, 13));
    const unused2 = parseInt(dateTimeBinary.slice(13, 15));
    const SU = parseInt(dateTimeBinary.slice(15, 16));
    const day = parseInt(dateTimeBinary.slice(16, 21));
    const yearLow = parseInt(dateTimeBinary.slice(21, 24));
    const month = parseInt(dateTimeBinary.slice(24, 28));
    const yearHigh = parseInt(dateTimeBinary.slice(28, 32));
    const year = yearHigh << 4 | yearLow;
    
    return {
      payload_style: msgFormatIdentifier,
      minute: minute,
      unused1: unused1,
      IV: IV,
      hour: hour,
      unused2: unused2,
      SU: SU,
      day: day,
      month: month,
      year: year
    };
}
  
module.exports = function (payload, meta) {
  const buf = Buffer.from(payload, 'hex');
  const msgType = buf[0];
  let result = { error: 'Unknown message type. Please check parser.' };

  
  if (msgType == 0x05) {
    result = parseStandard(buf);
  } else if (msgType == 0x06) {
        result = parseCompact(buf);
    } else if (msgType == 0x07) {
        result = parseJSON(buf);
    } else if (msgType == 0x08) {
        result = parseScheduledDailyRedundant(buf);
    } else if (msgType == 0x09) {
        result = parseScheduledExtended(buf);
    } else if (msgType == 0x0A) {
        result = parseCombinedHeatCooling(buf);
    } else if (msgType == 0x0B) {
        result = simpleBilling(buf);
    } else if (msgType == 0x0C) {
        result = plausibilityCheck(buf);
    } else if (msgType == 0x0D) {
        result = monitoring(buf);
    } else if (msgType == 0xFA) {
        result = parseClockMessage(buf);
    }
  return result;
}
