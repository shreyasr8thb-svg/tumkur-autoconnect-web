// App.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

// --- Dummy Screen Components ---
const DashboardScreen = () => < View style = { styles.screen } > < Text style = { styles.text } > Dashboard < /Text></View > ;
const MapScreen = () => < View style = { styles.screen } > < Text style = { styles.text } > Live Map < /Text></View > ;
const JobsScreen = () => < View style = { styles.screen } > < Text style = { styles.text } > Job Board < /Text></View > ;
const ProfileScreen = () => < View style = { styles.screen } > < Text style = { styles.text } > Profile Settings < /Text></View > ;

// --- Global Footer Component ---
const GlobalFooter = () => ( <
    View style = { styles.footerContainer } >
    <
    Text style = { styles.footerText } >
    This app is designed and crafted by Roaring Thunders with❤️ <
    /Text> <
    Text style = { styles.footerText } >
    Help & Support: tumkuru.connect @gmail.com <
    /Text> <
    /View>
);

// --- Main App Router ---
export default function App() {
    // In production, this comes from your Auth Provider (Firebase)
    const userRole = 'WORKER'; // Change to 'INDUSTRY_HR' or 'DRIVER' to test dynamic tabs

    return ( <
        SafeAreaView style = { styles.safeArea } >
        <
        NavigationContainer theme = { darkTheme } >
        <
        Tab.Navigator screenOptions = {
            ({ route }) => ({
                headerStyle: { backgroundColor: '#000000' },
                headerTintColor: '#fff',
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#ff3b30',
                tabBarInactiveTintColor: '#8e8e93',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
                    else if (route.name === 'Jobs' || route.name === 'Dashboard') iconName = focused ? 'briefcase' : 'briefcase-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    return <Ionicons name = { iconName }
                    size = { size }
                    color = { color }
                    />;
                },
            })
        } >
        {
            userRole === 'INDUSTRY_HR' && ( <
                >
                <
                Tab.Screen name = "Dashboard"
                component = { DashboardScreen }
                /> <
                Tab.Screen name = "Map"
                component = { MapScreen }
                /> <
                />
            )
        }

        {
            userRole === 'WORKER' && ( <
                >
                <
                Tab.Screen name = "Jobs"
                component = { JobsScreen }
                /> <
                Tab.Screen name = "Map"
                component = { MapScreen }
                /> <
                />
            )
        }

        {
            userRole === 'DRIVER' && ( <
                >
                <
                Tab.Screen name = "Map"
                component = { MapScreen }
                /> <
                />
            )
        }

        { /* All roles get a profile */ } <
        Tab.Screen name = "Profile"
        component = { ProfileScreen }
        /> <
        /Tab.Navigator> <
        /NavigationContainer>

        <
        GlobalFooter / >
        <
        /SafeAreaView>
    );
}

// --- Styles & Theme ---
const darkTheme = {
    dark: true,
    colors: {
        primary: '#ff3b30',
        background: '#000000',
        card: 'rgba(28, 28, 30, 0.9)', // Frosted glass approximation
        text: '#ffffff',
        border: '#38383a',
        notification: '#ff3b30',
    },
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000000',
    },
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    text: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '600',
    },
    tabBar: {
        backgroundColor: 'rgba(20, 20, 20, 0.9)',
        borderTopWidth: 0,
        elevation: 0,
        position: 'absolute', // Allows content to flow behind if needed for frosted effect
    },
    footerContainer: {
        backgroundColor: '#000000',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#333333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        color: '#8e8e93',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 2,
        fontWeight: '400',
    },
});