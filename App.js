import React, { useEffect, Component, useRef, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, PanResponder, Animated } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import moment from 'moment';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
//import api from '../../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

class Draggable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // objeto com x e y de posição inicial
      pan: new Animated.ValueXY({ x: 0, y: 0 }),
      currentX: 0,
      currentY: 0,
    };
  }

  // METODO X E Y PARA VER O TAMANHO MÁXIMO DO BOX DRAGABLE
  // SE RETORNAR TRUE, ATUALIZA O POSITION
  // SE RETORNAR FALSE, NÃO MOVE MAIS
  setXWithMaxCanvasSize = (x, y) => {
    if(x <= 380 && y <= 600) return true;
    return false;
  }

  componentWillMount() {
    this._val = { x:1.8181781768798828 , y: 292.00000762939453 }
    this.state.pan.addListener((value) => this._val = value);
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      // METODO QUE RECEBE AS ATUALIZAÇÕES DE POSIÇÃO ENQUANTO MOVE O OBJETO
      // SE O GESTURE.MOVEX > 295 PARA DE MOVER O OBJETO
      // SE O GESTURE.MOVEY > 290 PARA DE MOVER O OBJETO
      // O METODO PERMITE O MOVIMENTO ENQUANTO A FUNÇÃO SETXWITHMAXCANVASSIZE RETORNAR TRUE
      onMoveShouldSetPanResponder: (e, gesture) => this.setXWithMaxCanvasSize(gesture.moveX, gesture.moveY),
      // METODO QUE EXECUTA ASSIM QUE RECEBERMOS A AÇÃO DE MOVIMENTAÇÃO
      // QUANDO MOVER O OBJETO DEFINE O X E Y PARA VALORES DIFERENTES
      onPanResponderGrant: (e, gesture) => {
        this.state.pan.setOffset({
          x: this.state.pan.x._value,
          y: this.state.pan.y._value,
        });

        // RESETA A POSIÇÃO DO PAN PARA A POSIÇÃO INICIAL
        this.state.pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.pan.x  , dy: this.state.pan.y  }
      ], {
        // LISTENER QUE POSSUI ACESSO AO STATE DO GESTURE
        // COM ELE É POSSÍVEL SETAR OS VALORES DE ESTADOS BASEADOS
        // NA POSICAO DO OBJETO
        listener: (e, gesture) => {
          console.log(
            'STATE DO X', gesture.moveX,
            'STATE DO Y', gesture.moveY,
          )
          // RECUPERA DAS PROPS PASSADAS O METODO SET CURRENT POSITION DO COMPONENTE PAI
          // E SETA OS VALORES DO ESTADO
          this.props.setCurrentPosition({
            x: gesture.moveX,
            y: gesture.moveY,
          });
        }
      }),
      // METODO QUE EXECUTA AO SOLTAR O DRAG
      onPanResponderRelease: (e, gesturestate) => {
        // ATUALIZA A POSIÇÃO INICIAL DO DRAG PARA A POSIÇÃO EM QUE FOI SOLTO
        // ISSO GARANTE QUE O OBJETO SE MANTENHA NA POSIÇÃO EM QUE FOI SOLTO
        // E DEFINE O X:0 e Y:0 COMO SENDO A POSICAO EM QUE FOI SOLTO
		//this.state.pan.flattenOffset();
		Animated.spring(
			this.state.pan,
			{toValue:{x:0,y:0}}
		).start();
      },  
    })

  }
    

  render() {
    const panStyle = {
      transform: this.state.pan.getTranslateTransform(),
      // CASO O COMANDO ACIMA NÃO FUNCIONE ESTE STYLES DEVE RESOLVER
      // transform: [
      //   { translateX: this.state.pan.x },
      //   { translateY: this.state.pan.y },
      // ]
    }
    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={[styles.circle, panStyle]}
        // style={[styles.circle, ...panStyle]}
      >
        <Text selectable={false}>
          <MaterialCommunityIcons name="crosshairs-gps" size={30} color="black" />
        </Text>
      </Animated.View>
    );
  }
}


let CIRCLE_RADIUS = 15;
let styles = StyleSheet.create({
  circle: {
    backgroundColor: "skyblue",
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS
  },
  container: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
  },
  super: {
    padding: 30,
    height: '100%',
  }
});

export default function DueFlowControl() {
  //const navigation = useNavigation();
  //const route = useRoute();
  //const _ip = route.params.ipAddress;
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setInterval(() => {
      var date = moment().utcOffset('+05:30').format('YYYY-MM-DD hh:mm:ss a');
      console.log("Checking State", date)
    }, 10000)
  }, []);

  async function SendCommand(cmd) {
    const url = 'http://'+ _ip +'/api/printer/command';
    const data = { 'command': cmd };

    console.log(url)

    const response = await api.post(url, JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'F4944B335B634FF29D563D5F92E9FB7D' }
    });

    console.log(response)
  }
  


  return (
    <View style={{ flex: 1, margin: 15, marginTop: 100 }}>
      {/* <Text>Due Flow Controll:{_ip}</Text> */}
      <View style={{ flex: 1, borderColor: 'black', borSderWidth: 3, }}>
        <View style={styles.container}>
          {/* PASSAR O SETCURRENTPOSITION PARA PODER ATUALIZAR O ESTADO DO COMPONENTE A PARTIR DO COMPONENTE FILHO */}
          <Draggable setCurrentPosition={setCurrentPosition} />        
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ marginRight: 4 }}>Posição:</Text>
        {/* USAR O CURRENT POSITION STATE PARA RECUPERAR OS VALORES DE POSICAO */}
        <Text style={{ fontWeight: 'bold' }}>x = {currentPosition.x*380/4} , y = {currentPosition.y*600}</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View >
          <TouchableOpacity style={{ backgroundColor: '#e6e6e6', padding: 8, margin: 4, borderRadius: 2, marginLeft: 300 }}><AntDesign name="pausecircle" size={24} color="black" /></TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#e6e6e6', padding: 8, margin: 4, borderRadius: 2, marginLeft: 300 }}><Entypo name="retweet" size={24} color="black" /></TouchableOpacity>
        </View>
      </View>
      <View >
        <Text style={{ marginLeft: 150 }}>Tamanho do passo:10mm</Text>

      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center', margin: 20 }}>
        <Text style={{ marginRight: 200 }}>Disparo Rapido</Text>
        <TouchableOpacity style={{ backgroundColor: '#0075A0', padding: 8, margin: 4, borderRadius: 2, marginRight: 250 }}><AntDesign name="closecircle" size={24} color="black" /></TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity style={{ margin: 8, backgroundColor: '#0075A0', padding: 8, paddingHorizontal: 35, }}><Text style={{ color: "white" }}>Due It!</Text></TouchableOpacity>
        <TouchableOpacity style={{ margin: 8, backgroundColor: '#e6e6e6', padding: 8, paddingHorizontal: 35 }}><Text>Cancelar</Text></TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ marginRight: 8 }}>Situação:</Text>
        <Text style={{ fontWeight: 'bold' }}>Tampa de segurança aberta</Text>
      </View>

      <Text>Tempo decorrido:</Text>
      <Text>Tempo estimado:</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity style={{ backgroundColor: '#e6e6e6', padding: 8, margin: 4, borderRadius: 2, }}><Entypo name="arrow-bold-up" size={24} color="black" /></TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity style={{ backgroundColor: '#e6e6e6', padding: 8, margin: 4, borderRadius: 2, }}><Entypo name="arrow-bold-left" size={24} color="black" /></TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#e6e6e6', padding: 8, margin: 4, borderRadius: 2 }}><Entypo name="arrow-bold-down" size={24} color="black" /></TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#e6e6e6', padding: 8, margin: 4, borderRadius: 2 }}><Entypo name="arrow-bold-right" size={24} color="black" /></TouchableOpacity>
      </View>
    </View>
  );
}   