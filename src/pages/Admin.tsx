  // Mobile Bottom Tab Bar
  const BottomTabBar = () => {
    return (
      <View style={{ padding: 10, alignItems: 'center', justifyContent: 'space-around' }}>
        <TouchableOpacity style={{ margin: 5 }}>
          <Text style={{ fontSize: 16, color: 'black' }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ margin: 5, flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../assets/icons/settings.png')} style={{ width: 24, height: 24 }} />
          <Text style={{ fontSize: 16, color: 'black', marginLeft: 5 }}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ margin: 5 }}>
          <Text style={{ fontSize: 16, color: 'black' }}>Profile</Text>
        </TouchableOpacity>
      </View>
    );
  };