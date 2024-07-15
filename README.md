# Distant Heat Hex-Parser
Repository for collaborative development and testing of distant heat hex code parser.

## Device Types and Elvaco Modules
The Parser must be developed for 4 different device types:
- Landis & Gyr ULTRAHEAT T330 (UH30) 
- Landis & Gyr ULTRAHEAT T550 (UH50) 
- Diehl Sharky 775 (Sharky) 
- Itron CF Echo 2 (Itron) 

Every device type has its own elvaco LoRaWAN module.
- UH30    -->   [Elvaco_CMi4111](./docs/manuals/UH30_Elvaco_CMi4111.pdf)
- UH50    -->   [Elvaco_CMi4110](./docs/manuals/UH50_Elvaco_CMi4110.pdf)
- Sharky  -->   [Elvaco_CMi4160](./docs/manuals/Sharky_Elvaco_CMi4160.pdf)
- ITRON   -->   [Elvaco_CMi4130](./docs/manuals/Itron_Elvaco_CMi4130.pdf)

## Parsing challenges
Most of the parsing is simple transformation from hex to human readable format. But there are more challenging issues included:
### Error Flags
Error flags can easily be transformed to an integer. But in order to transform this into human readable format, its necessary to read the active error bites and add the according error messages provided by the producer of the meters (UH30 / UH50 ... --> not part of the elvaco module / manual).

[errorFlags.xlsx](./docs/ErrorFlags.xlsxdocs)

Several errors can occur on the same time. Which final format to chose for the errorflags. Also see meter communications error below. 

### Unit Conversion Testing
Measurements can be send in different units. But idealy they´re parsed in a consistent unit over all packets and device types.
Unit convertion can be error prone (comma error). Therefore proper automated testing is necessary.

### Meter Communication Error
S. Elvaco module manuals about meter communication error. How to parse this?

### Negative Values - Unsigned vs signed
In the past negative values have sometimes caused the result to be wrong. 

### Plausibility Checks
How can we make sure that the parsed value is in a plausible range?

### Creation of further testcases
S. Unit Convertion

## Current Versions
The current parser versions for UH30 and UH50 are to find in the "old" folder:

- [UH30](./old/UH30_old_niotix.js)
- [UH50](./old/UH50_old_niotix.js)



