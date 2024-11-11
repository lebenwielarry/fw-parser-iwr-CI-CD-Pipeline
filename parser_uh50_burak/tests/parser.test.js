const parseUH50 = require('../src/parser');

test('Parse Standard Message Payload', () => {
    const payload = "000C07785533000C14302895070B2D9213000B3B4039000A5A70090A5E60060C786867836902FD170000";
    const result = parseUH50(payload);  // Annahme, dass parseUH50 die Funktion ist, die das Payload analysiert

    // Energy Field
    expect(result.energyPrefix).toBe("0C07");  // Präfix für Energy: MWh mit 2 Dezimalstellen
    expect(result.energy).toBe(33642.16);  // Endwert: 33642.16 MWh
    
    // Volume Field
    expect(result.volumePrefix).toBe("0C14");  // Präfix für Volume: m³ mit 2 Dezimalstellen
    expect(result.volume).toBe(1272156.64);  // Endwert: 1272156.64 m³

    // Power Field
    expect(result.powerPrefix).toBe("0B2D");  // Präfix für Power: kW mit 1 Dezimalstelle
    expect(result.power).toBe(501.0);  // Endwert: 501.0 kW

    // Flow Field
    expect(result.flowPrefix).toBe("0B3B");  // Präfix für Flow: m³/h mit 1 Dezimalstelle
    expect(result.flow).toBe(14.656);  // Endwert: 146.56 m³/h

    // Forward Temperature Field
    expect(result.fwTempPrefix).toBe("0A5A");  // Präfix für Vorlauftemperatur: °C mit 1 Dezimalstelle
    expect(result.forwardTemperature).toBe(241.6);  // Endwert: 24.16 °C

    // Return Temperature Field
    expect(result.rtTempPrefix).toBe("0A5E");  // Präfix für Rücklauftemperatur: °C mit 1 Dezimalstelle
    expect(result.returnTemperature).toBe(163.2);  // Endwert: 16.32 °C

    // Meter ID Field
    expect(result.meterIDValuePrefix).toBe("0C78");  // Präfix für Meter ID
    expect(result.meterId).toBe("68678369");  // Endwert: 68678369

    // Error Flags Field
    expect(result.errorBitsValuePrefix).toBe("02FD17");  // Präfix für Error Flags
    expect(result.errors).toBe(0);  // Endwert: keine Fehler
});

test('Parse Standard Message Payload 2', () => {
    const payload = "000CFB09ABCD12000C15987654320B2C1122330B3D5566770A5B34560A5F789A0C781234567802FD170000";
    const result = parseUH50(payload);  // Annahme, dass parseUH50 die Funktion ist, die das Payload analysiert

    // Energy Field
    expect(result.energyPrefix).toBe("0CFB09");  // Präfix für Energy: GJ mit 2 Dezimalstellen
    expect(result.energy).toBe(4436.24091007272);  // Endwert: 4436.24091007272 MWh
    
    // Volume Field
    expect(result.volumePrefix).toBe("0C15");  // Präfix für Volume: m³ mit 2 Dezimalstellen
    expect(result.volume).toBe(84439618.4);  // Endwert: 84439618.4 m³

    // Power Field
    expect(result.powerPrefix).toBe("0B2C");  // Präfix für Power: kW mit 2 Dezimalstellen
    expect(result.power).toBe(33510.57);  // Endwert: 33510.57 kW

    // Flow Field
    expect(result.flowPrefix).toBe("0B3D");  // Präfix für Flow: m³/h mit 2 Dezimalstellen
    expect(result.flow).toBe(782498.1);  // Endwert: 782498.1 m³/h

    // Forward Temperature Field
    expect(result.fwTempPrefix).toBe("0A5B");  // Präfix für Vorlauftemperatur: °C mit 1 Dezimalstelle
    expect(result.forwardTemperature).toBe(22068);  // Endwert: 22068 °C

    // Return Temperature Field
    expect(result.rtTempPrefix).toBe("0A5F");  // Präfix für Rücklauftemperatur: °C mit 1 Dezimalstelle
    expect(result.returnTemperature).toBe(39544);  // Endwert: 39544 °C

    // Meter ID Field
    expect(result.meterIDValuePrefix).toBe("0C78");  // Präfix für Meter ID
    expect(result.meterId).toBe("12345678");  // Endwert: 12345678

    // Error Flags Field
    expect(result.errorBitsValuePrefix).toBe("02FD17");  // Präfix für Error Flags
    expect(result.errors).toBe(0);  // Endwert: keine Fehler
});