# Distant Heat Hex-Parser
Repository for collaborative development and testing of distant heat hex code parser.

## Device Types and Elvaco Modules
The Parser must be developed for 4 different device types:
- Landys&Gyr ULTRAHEAT T330 (UH30) 
- Landys&Gyr ULTRAHEAT T550 (UH50) 
- Diehl Sharky 775 (Sharky) 
- Itron CF Echo 2 (Itron) 

Every device type has its own elvaco LoRaWAN module.
- UH30    -->   Elvaco_CMi4111
- UH50    -->   Elvaco_CMi4110
- Sharky  -->   Elvaco_CMi4160
- ITRON   -->   Elvaco_CMi4130

The manuals with parsing instructions are included in the manuals folder of this project.

## Parsing challenges
Most if the parsing easy simple transformation from hex to human readable format. But there are more challenging issues included:
### Error Flags
Error flags can easily be transformed in an int. But in order to transform this into human readable format, its necessary to read the active error bites and add the according error message provided by the producer of the meters (UH30 / UH50 ... --> not part of the elvaco module / manual).
--> Information to error flags are provided below

Several errors can occur on the same time. Which final format to chose for the errorflags. Also see meter communications error below. 

### Unit Conversion Testing
Measurements can be send in different units. But idealy they´re parsed in a consistent unit over all packets and device types.
Unit convertion can be error prone (comma error). Therefore a proper automated testing is necessary.

### Meter Communication Error
S. Elvaco module manuals about meter communication error. How to parse this?

### Negative Values - Unsigned vs signed
In the past negative values have sometimes caused the result to be wrong. 

### Plausibility Checks
How can we make sure that the parsed value is in a plausible range?


## Error Flag Docs

### UH30
![image](https://github.com/user-attachments/assets/ef169d42-92ca-4303-827c-0d8e6c5dfecb)

### UH50
![image](https://github.com/user-attachments/assets/5b3c40a5-c3ed-4994-99a4-a8a89f65b680)

### Itron
![image](https://github.com/user-attachments/assets/1f925146-28b4-4637-a0c9-ca222605c23c)
### Sharky
![image](https://github.com/user-attachments/assets/6f53682f-d836-4d24-ac11-7b80c5b91218)
![image](https://github.com/user-attachments/assets/a1050455-3913-44ea-954c-7c13dc040fd7)



