import { useState, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();

function Items() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select id, weight, height, bmi, date(itemDate) as itemDate from items order by itemDate desc;`,
        [],
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);

 // const heading = doneHeading ? "BMI History" : "Bmi History";

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>BMI History</Text>
      {items.map(({ id, itemDate, bmi ,weight, height }) => (
      
          <Text key={id} style={styles.history} >{itemDate}:  {bmi} (W:{weight}, H:{height}) </Text>
      ))}
    </View>
  );
}

export default function App() {
  const [text, setText] = useState(null);
  const [text2, setText2] = useState(null); 
  const [text3, setText3] = useState(null);
  const [text4, setText4] = useState(null);
  const [bmi, setBmi] = useState('');  
  const [forceUpdate, forceUpdateId] = useForceUpdate(); //Old
  const [storedValues, setStoredValue] = useState('');

  useEffect(() => {
    db.transaction((tx) => {
     // tx.executeSql(
     //   "drop table items;"
      //);
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, weight real, height real, bmi real, itemDate real);"
      );
    });
  }, []);

  const add = (text, text2, bmi) => {
    // is text empty?
    //if (text === null || text === "") {
    //  return false;
    //}
    
    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (weight, height, bmi ,itemDate) values (?, ?, ?,julianday('now'))", [text, text2, bmi]);
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      forceUpdate
    );
  };

  const onChange = (text) => {
    setText(text);
    setBmi((text /(text2 * text2)*703).toFixed(1));
    
  };
  const onChange2 = (text2) => {
    setText2(text2);
    setBmi((text /(text2 * text2)*703).toFixed(1));
    
  };

  const onCalculate = async () => {
    setStoredValue(bmi);
    add(text, text2, bmi);

        if(bmi > 0) {
          setText4('Body Mass Index is ');
      } else if (bmi > 25.0 && bmi < 29.9) {
        setText3(' ');
      }
      
      
        if(bmi > 30.0) {
          setText3('(Obese)');
      } else if (bmi > 25.0 && bmi < 29.9) {
        setText3('(Overweight)');
      } else if (bmi > 18.5 && bmi < 24.9) {
        setText3('(Healthy)');
      }else if (bmi < 18.8) {
        setText3('(Underweight)');
      } 
   };

  return (
    <View style={styles.container}>
      <Text style={styles.titles}>BMI Calculator</Text>

      {Platform.OS === "web" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.heading}>
            Expo SQlite is not supported on web!
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.flexRow}>
            <TextInput
              onChangeText= {onChange}
              placeholder="Weight in Pounds"
              style={styles.input}
              value={text}
            />
          </View>
          <View style={styles.flexRow}>
            <TextInput
              onChangeText= {onChange2}
              placeholder="Height in Inches"
              style={styles.input2}
              value={text2}
            />
          </View>

          <Pressable  
          onPress={onCalculate} 
          style={styles.button}>
          <Text  style={styles.buttonText} >Compute BMI</Text>
          </Pressable>

          <Text style={styles.result}>{text4} {storedValues} </Text>
          <Text style={styles.result2} > {text3} </Text>

          <ScrollView style={styles.listArea}>
            <Items/> 
          </ScrollView>
        </>
      )}
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  flexRow: {
    flexDirection: "row",
  },
  listArea: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 24,
    marginBottom: 8,
  },
  titles: {
    backgroundColor: '#f4511e',
    width: 400,
    height: 100,
    paddingTop: 35,
    paddingBottom: 30,
    textAlign: 'center',
    color: 'white',
    marginBottom: 50,
    fontSize: 28,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    width: "100%",
    height: 40,
    padding: 5,
    fontSize: 24,
  },
  input2: {
    marginTop:15,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    width: "100%",
    height: 40,
    padding: 5,
    fontSize: 24,
  },
  button: {
    backgroundColor: '#34495e',
    padding: 10,
    borderRadius: 3,
    marginTop: 10,
    width: "100%",
    fontSize: 24, 
  },
  buttonText: {
    color:'white',
    textAlign: 'center',
    fontSize: 24  
   },
  result: {
    marginTop:20,
    padding: 10,
    textAlign: 'center',
    color: 'black',
    fontSize: 28
  },
  result2: {
    padding: 10,
    textAlign: 'center',
    color: 'black',
    marginBottom: 3,
    fontSize: 28
  },
  history: {
    fontSize: 20
  },
});