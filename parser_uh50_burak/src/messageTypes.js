const { parseBCD, parseUint16, parseDateTime, reverse, parseMeterId, reverseString, 
    switchingStandardEnergy,
    switchingStandardVolume,
    switchingStandardPower,
    switchingStandardFlow,
    switchingStandardForwardTemperature,
    switchingStandardReturnTemperature,
    switchingScheduledEnergy,
    switchingScheduledAccumulatedEnergy, reverseAndConvertToDecimal } = require('./utils'); 

function parseStandardMessage(payload) {
    const result = {};
    let currentIndex = 2; // Start after the 2-character message type

    // Energy Field (6-7 bytes, including prefix)
    let energyPrefix = payload.slice(currentIndex, currentIndex + 4);
    let energyValueRaw, energyValueTransformed, scale, check;
    
    if (energyPrefix === '0CFB') { // Handles 6-digit prefixes (3 bytes)
        energyPrefix = payload.slice(currentIndex, currentIndex + 6);
        currentIndex += 6; // Move past the 3-byte prefix (6 hex characters)
        energyValueRaw = reverseAndConvertToDecimal(payload.slice(currentIndex, currentIndex + 8)); // Reverse the slice from currentIndex
        [scale, check] = switchingStandardEnergy(payload.slice(currentIndex - 6, currentIndex)); // Using switching for standard energy
        energyValueTransformed = energyValueRaw / scale;
        result.energy = energyValueTransformed; 
        currentIndex += 8; // Move past the energy field
    } else { // Handles 4-digit prefixes (2 bytes)
        currentIndex += 4; // Move past the 2-byte prefix (4 hex characters)
        energyValueRaw = reverseAndConvertToDecimal(payload.slice(currentIndex, currentIndex + 8)); // Reverse the slice from currentIndex
        [scale, check] = switchingStandardEnergy(payload.slice(currentIndex - 4, currentIndex)); // Using switching for standard energy
        energyValueTransformed = energyValueRaw / scale;
        result.energy = energyValueTransformed; 
        currentIndex += 8; // Move past the energy field
    }
    
    
    result.energyPrefix = energyPrefix;
    // Volume Field (adjusted index based on the length of the energy field)
    const volumePrefix = payload.slice(currentIndex, currentIndex + 4);
    result.volumePrefix = volumePrefix;
    let volumeValueRaw, volumeValueTransformed;
    currentIndex += 4; // Move past the prefix
    volumeValueRaw = reverseAndConvertToDecimal(payload.slice(currentIndex, currentIndex + 8)); // Reverse the slice from currentIndex
    console.log(volumeValueRaw);
    [scale, check] = switchingStandardVolume(volumePrefix); // Using switching for standard volume
    console.log(scale);
    volumeValueTransformed = volumeValueRaw / scale;
    console.log(volumeValueTransformed);
    result.volume = volumeValueTransformed;
    currentIndex += 8; // Move past the volume field

    // Power Field
    const powerPrefix = payload.slice(currentIndex, currentIndex + 4);
    result.powerPrefix = powerPrefix;
    let powerValueRaw, powerValueTransformed;
    currentIndex += 4; // Move past the prefix
    powerValueRaw = reverseAndConvertToDecimal(payload.slice(currentIndex, currentIndex + 6)); // Reverse the slice from currentIndex
    [scale, check] = switchingStandardPower(powerPrefix); // Using switching for power field
    powerValueTransformed = powerValueRaw / scale;
    result.power = powerValueTransformed;
    currentIndex += 6; // Move past the power field

    // Flow Field
    const flowPrefix = payload.slice(currentIndex, currentIndex + 4);
    result.flowPrefix = flowPrefix;
    let flowValueRaw, flowValueTransformed;
    currentIndex += 4; // Move past the prefix
    flowValueRaw = reverseAndConvertToDecimal(payload.slice(currentIndex, currentIndex + 6)); // Reverse the slice from currentIndex
    [scale, check] = switchingStandardFlow(flowPrefix); // Using switching for flow field
    flowValueTransformed = flowValueRaw / scale;
    result.flow = flowValueTransformed;
    currentIndex += 6; // Move past the flow field

    // Forward Temperature Field
    const fwTempPrefix = payload.slice(currentIndex, currentIndex + 4);
    result.fwTempPrefix = fwTempPrefix;
    let fwTempValueRaw, fwTempValueTransformed;
    currentIndex += 4; // Move past the prefix
    fwTempValueRaw = reverseAndConvertToDecimal(payload.slice(currentIndex, currentIndex + 4)); // Reverse the slice from currentIndex
    [scale, check]= switchingStandardForwardTemperature(fwTempPrefix); // Using switching for temperature
    fwTempValueTransformed = fwTempValueRaw / scale;
    result.forwardTemperature = fwTempValueTransformed;
    currentIndex += 4; // Move past the forward temperature field

    // Return Temperature Field
    const rtTempPrefix = payload.slice(currentIndex, currentIndex + 4);
    result.rtTempPrefix = rtTempPrefix;
    let rtTempValueRaw, rtTempValueTransformed;
    currentIndex += 4; // Move past the prefix
    rtTempValueRaw = reverseAndConvertToDecimal(payload.slice(currentIndex, currentIndex + 4)); // Reverse the slice from currentIndex
    [scale, check] = switchingStandardReturnTemperature(rtTempPrefix); // Using switching for temperature
    rtTempValueTransformed = rtTempValueRaw / scale;
    result.returnTemperature = rtTempValueTransformed;
    currentIndex += 4; // Move past the return temperature field

    // Meter ID (6 bytes)
    const meterIDValuePrefix = payload.slice(currentIndex, currentIndex +4);
    result.meterIDValuePrefix = meterIDValuePrefix;
    currentIndex +=4;
    const meterIdValue = payload.slice(currentIndex, currentIndex + 8); // Reverse the slice from currentIndex as a string
    result.meterId = meterIdValue;
    currentIndex += 8; // Move past the meter ID field

    // Error Flags (4 bytes)
    const errorBitsValuePrefix = payload.slice(currentIndex, currentIndex + 6);
    result.errorBitsValuePrefix = errorBitsValuePrefix;
    currentIndex += 6;
    const errorBitsValue = reverseAndConvertToDecimal(payload.slice(currentIndex, currentIndex + 4)); // Reverse the slice from currentIndex
    result.errors = errorBitsValue;
    currentIndex += 4; // Move past the error flags
    return result;
}

function parseCompactMessage(payload) {
    const energy = parseBCD(payload.substr(2, 12));  // 6 bytes (12 hex characters)
    const meterId = payload.substr(14, 12);          // 6 bytes (12 hex characters)
    const errorFlags = parseUint16(payload.substr(26, 10));  // 5 bytes
    return {
        messageType: 'Compact',
        energy,
        meterId,
        errorFlags,
    };
}

function parseJsonMessage(payload) {
    try {
        // Strip the first 2 characters (message type "02"), convert the rest from hex to a UTF-8 string
        const jsonHex = payload.substr(2); // Remove the '02' prefix
        const jsonString = Buffer.from(jsonHex, 'hex').toString('utf8');
        
        // Parse the JSON string
        const parsedJson = JSON.parse(jsonString);
        
        return {
            messageType: 'JSON',
            data: parsedJson
        };
    } catch (error) {
        throw new Error("Invalid JSON payload");
    }
}

function parseScheduledClockMessage(payload) {
    const result = {};
    
    // Byte 0 (Message Type Identifier)
    const messageType = payload.substr(0, 2);
    if (messageType !== 'FA') {
        throw new Error("Invalid clock message type");
    }

    // Byte 1 (DIF)
    const dif = payload.substr(2, 2);
    result.valid = dif === '04';

    // Byte 2 (VIF)
    const vif = payload.substr(4, 2);
    if (vif !== '6D') {
        throw new Error("Invalid VIF for clock message");
    }

    // Bytes 3-6 (Date/Time in M-Bus format F)
    const dateTimeHex = payload.substr(6, 8); // 4 bytes for date/time
    result.dateTime = Buffer.from(dateTimeHex, 'hex').toString('hex');

    console.log("Parsed Clock Message: ", result);
    return result;
}

function parseScheduledDataMessage(payload) {
    const result = {};
    result.messageType = 'Scheduled';  // Define the message type
    let currentIndex = 2;  // Start after the message type '03'

    // Energy Field (handle both 6-digit and 4-digit prefixes)
    const energyPrefix = payload.slice(2, 6);
    let energyValueRaw, energyValueTransformed, scale, check;
    console.log("energyPrefix:", energyPrefix);

    // Determine if it's a 4 or 6-character prefix by checking the known prefixes
    if (energyPrefix.startsWith('0CFB')) { // Handle 6-character prefix
        energyValueRaw = reverseAndConvertToDecimal(payload.slice(6, 14)); // Reverse the slice from 6 to 14
        [scale, check] = switchingScheduledEnergy(payload.slice(2, 8));  // Use the correct switching for 6-character prefix
        energyValueTransformed = energyValueRaw / scale;
        result.energy_mwh = energyValueTransformed;
        currentIndex += 14; // Move index forward by 14 (6 for prefix + 8 for data)
    } else { // Handle 4-character prefix
        energyValueRaw =payload.slice(6,14);
        console.log("energyValueRawBeforeConversion",energyValueRaw);
        energyValueRaw = reverseAndConvertToDecimal(energyValueRaw); // Reverse the slice from 6 to 14
        console.log("energyvalueraw: ", energyValueRaw)
        let x = payload.slice(2,6);
        [scale, check] = switchingScheduledEnergy(x);  // Use the correct switching for 4-character prefix
        console.log("scale: ", scale);
        energyValueTransformed = energyValueRaw / scale;
        result.energy_mwh = energyValueTransformed;
        currentIndex += 12; // Move index forward by 12 (4 for prefix + 8 for data)
    }

    console.log("Parsed Energy (MWh):", result.energy_mwh);

    // Meter ID (6 bytes, including prefix)
    const meterIdPrefix = payload.substr(currentIndex, 4);
    let meterIdHex = payload.substr(currentIndex + 4, 8);  // 6 bytes for meter ID
    result.meter_id = reverseString(meterIdHex);
    currentIndex += 12;

    console.log("Parsed Meter ID:", result.meter_id);

    // Date/Time Field
    const dateTimePrefix = payload.substr(currentIndex, 4);
    let dateTimeHex = payload.substr(currentIndex + 4, 12);  // 6 bytes for date and time
    result.date_time = parseDateTime(dateTimeHex);  // Use the correct function to parse date and time
    currentIndex += 12;

    console.log("Parsed Date/Time:", result.date_time);

    // Accumulated Energy (6 bytes, including prefix)
    const accumulatedEnergyPrefix = payload.substr(currentIndex, 4);
    let accumulatedEnergyHex = payload.substr(currentIndex + 4, 8);  // 4 bytes for accumulated energy
    console.log("Accumulated Energy Hex (before reverse):", accumulatedEnergyHex);

    let reversedAccumulatedEnergyHex = reverseString(accumulatedEnergyHex);
    console.log("Reversed Accumulated Energy Hex:", reversedAccumulatedEnergyHex);

    const accumulatedEnergyFactor = switchingScheduledAccumulatedEnergy(accumulatedEnergyPrefix)[0];
    let parsedAccumulatedEnergy = parseBCD(reversedAccumulatedEnergyHex);
    result.accumulated_energy_mwh = parsedAccumulatedEnergy / accumulatedEnergyFactor;

    console.log("Parsed Accumulated Energy (MWh):", result.accumulated_energy_mwh);
    currentIndex += 12;

    // Error Flags (4 bytes)
    const errorBitsValue = reverseAndConvertToDecimal(payload.slice(currentIndex, currentIndex + 4));  // Reverse the slice from currentIndex to currentIndex + 4
    console.log("Parsed Error Flags:", errorBitsValue);
    result.errors = errorBitsValue;

    console.log("Parsed Result:", result);
    return result;
}

function parseScheduledExtendedMessage(payload) {
    const energy = parseBCD(payload.substr(2, 12));  // 6 bytes (12 hex characters)
    const volume = parseBCD(payload.substr(14, 12));  // 6 bytes (12 hex characters)
    const power = parseBCD(payload.substr(26, 12));   // 6 bytes (12 hex characters)
    const flow = parseBCD(payload.substr(38, 10));    // 5 bytes (10 hex characters)
    const fwTemp = parseBCD(payload.substr(48, 8));   // 4 bytes (8 hex characters)
    const rtTemp = parseBCD(payload.substr(56, 8));   // 4 bytes (8 hex characters)
    const meterId = payload.substr(64, 12);           // 6 bytes (12 hex characters)
    const dateTime = payload.substr(76, 12);          // 6 bytes (12 hex characters)
    const errorFlags = parseUint16(payload.substr(88, 10));  // 5 bytes (10 hex characters)

    return {
        messageType: 'Scheduled-Extended',
        energy,
        volume,
        power,
        flow,
        forwardTemperature: fwTemp,
        returnTemperature: rtTemp,
        meterId,
        dateTime,
        errorFlags,
    };
}
function parseScheduledExtendedPlusTelegram1(payload) {
    const energy = parseBCD(payload.substr(2, 12));  // 6 bytes (12 hex characters)
    const tariff1 = parseBCD(payload.substr(14, 16));  // 8 bytes (16 hex characters)
    const tariff2 = parseBCD(payload.substr(30, 16));  // 8 bytes (16 hex characters)
    const tariff3 = parseBCD(payload.substr(46, 16));  // 8 bytes (16 hex characters)
    const meterId = payload.substr(62, 12);  // 6 bytes (12 hex characters)
    const dateTime = payload.substr(74, 12);  // 6 bytes (12 hex characters)

    return {
        messageType: 'Scheduled-Extended-Plus-Telegram1',
        energy,
        tariff1,
        tariff2,
        tariff3,
        meterId,
        dateTime,
    };
}
function parseScheduledExtendedPlusTelegram2(payload) {
    const volume = parseBCD(payload.substr(2, 12));  // 6 bytes (12 hex characters)
    const power = parseBCD(payload.substr(14, 10));  // 5 bytes (10 hex characters)
    const flow = parseBCD(payload.substr(24, 10));  // 5 bytes (10 hex characters)
    const fwTemp = parseBCD(payload.substr(34, 8));  // 4 bytes (8 hex characters)
    const rtTemp = parseBCD(payload.substr(42, 8));  // 4 bytes (8 hex characters)
    const meterId = payload.substr(50, 12);  // 6 bytes (12 hex characters)
    const dateTime = payload.substr(62, 12);  // 6 bytes (12 hex characters)
    const errorFlags = parseUint16(payload.substr(74, 10));  // 5 bytes (10 hex characters)

    return {
        messageType: 'Scheduled-Extended-Plus-Telegram2',
        volume,
        power,
        flow,
        forwardTemperature: fwTemp,
        returnTemperature: rtTemp,
        meterId,
        dateTime,
        errorFlags,
    };
}
function parseCompactTariffMessage(payload) {
    const energy = parseBCD(payload.substr(2, 12));  // 6 bytes (12 hex characters)
    const tariff1 = parseBCD(payload.substr(14, 16));  // 8 bytes (16 hex characters)
    const tariff2 = parseBCD(payload.substr(30, 16));  // 8 bytes (16 hex characters)
    const tariff3 = parseBCD(payload.substr(46, 16));  // 8 bytes (16 hex characters)
    const meterId = payload.substr(62, 12);  // 6 bytes (12 hex characters)
    const errorFlags = parseUint16(payload.substr(74, 10));  // 5 bytes (10 hex characters)

    return {
        messageType: 'Compact-Tariff',
        energy,
        tariff1,
        tariff2,
        tariff3,
        meterId,
        errorFlags,
    };
}

module.exports = {
    parseStandardMessage,
    parseCompactMessage,
    parseJsonMessage,
    parseScheduledClockMessage,
    parseScheduledDataMessage,
    parseScheduledExtendedMessage,
    parseScheduledExtendedPlusTelegram1,
    parseScheduledExtendedPlusTelegram2,
    parseCompactTariffMessage,
};

