import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - 5 * 20) / 4; // 4 columns with 5 gaps of 20px
const ZERO_BUTTON_WIDTH = BUTTON_SIZE * 2 + 20; // Double width for zero button

type Operation = '+' | '-' | '×' | '÷' | null;

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const handleNumberPress = (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimalPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const handleOperationPress = (op: Operation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForNewValue(true);
    setOperation(op);
  };

  const calculate = (first: number, second: number, op: Operation): number => {
    switch (op) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case '×':
        return first * second;
      case '÷':
        if (second === 0) {
          return NaN; // Handle division by zero
        }
        return first / second;
      default:
        return second;
    }
  };

  const handleEquals = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (previousValue !== null && operation) {
      const currentValue = parseFloat(display);
      const result = calculate(previousValue, currentValue, operation);
      
      if (isNaN(result)) {
        setDisplay('錯誤');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
      } else {
        setDisplay(String(result));
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
      }
    }
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const handleToggleSign = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (display !== '0') {
      setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
    }
  };

  const handlePercentage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
  };

  const formatDisplay = (value: string): string => {
    if (value === '錯誤') return value;
    
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    
    // Handle very large numbers
    if (Math.abs(num) >= 1e15) {
      return num.toExponential(6);
    }
    
    // Format the number to remove unnecessary trailing zeros
    return num.toString();
  };

  const Button: React.FC<{
    label: string;
    onPress: () => void;
    style?: 'number' | 'operation' | 'function';
    width?: number;
  }> = ({ label, onPress, style = 'number', width: buttonWidth = BUTTON_SIZE }) => {
    const getButtonStyle = () => {
      switch (style) {
        case 'operation':
          return styles.operationButton;
        case 'function':
          return styles.functionButton;
        default:
          return styles.numberButton;
      }
    };

    const getTextStyle = () => {
      switch (style) {
        case 'operation':
          return styles.operationText;
        case 'function':
          return styles.functionText;
        default:
          return styles.numberText;
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.button,
          getButtonStyle(),
          { width: buttonWidth, height: BUTTON_SIZE },
        ]}
        onPress={onPress}
        activeOpacity={0.7}>
        <Text style={[styles.buttonText, getTextStyle()]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {formatDisplay(display)}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.row}>
          <Button label="AC" onPress={handleClear} style="function" />
          <Button label="+/-" onPress={handleToggleSign} style="function" />
          <Button label="%" onPress={handlePercentage} style="function" />
          <Button label="÷" onPress={() => handleOperationPress('÷')} style="operation" />
        </View>

        <View style={styles.row}>
          <Button label="7" onPress={() => handleNumberPress('7')} />
          <Button label="8" onPress={() => handleNumberPress('8')} />
          <Button label="9" onPress={() => handleNumberPress('9')} />
          <Button label="×" onPress={() => handleOperationPress('×')} style="operation" />
        </View>

        <View style={styles.row}>
          <Button label="4" onPress={() => handleNumberPress('4')} />
          <Button label="5" onPress={() => handleNumberPress('5')} />
          <Button label="6" onPress={() => handleNumberPress('6')} />
          <Button label="-" onPress={() => handleOperationPress('-')} style="operation" />
        </View>

        <View style={styles.row}>
          <Button label="1" onPress={() => handleNumberPress('1')} />
          <Button label="2" onPress={() => handleNumberPress('2')} />
          <Button label="3" onPress={() => handleNumberPress('3')} />
          <Button label="+" onPress={() => handleOperationPress('+')} style="operation" />
        </View>

        <View style={styles.row}>
          <Button
            label="0"
            onPress={() => handleNumberPress('0')}
            width={ZERO_BUTTON_WIDTH}
          />
          <Button label="." onPress={handleDecimalPress} />
          <Button label="=" onPress={handleEquals} style="operation" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  displayContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 150,
  },
  display: {
    color: '#FFFFFF',
    fontSize: 80,
    fontWeight: '200',
    textAlign: 'right',
  },
  buttonContainer: {
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButton: {
    backgroundColor: '#333333',
  },
  operationButton: {
    backgroundColor: '#FF9500',
  },
  functionButton: {
    backgroundColor: '#A6A6A6',
  },
  buttonText: {
    fontSize: 36,
    fontWeight: '400',
  },
  numberText: {
    color: '#FFFFFF',
  },
  operationText: {
    color: '#FFFFFF',
  },
  functionText: {
    color: '#000000',
  },
});

