[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

# cordova-plugin-release-signed-bundle
Signs and/or bundles your cordova project automatically after android release builds

## Installation
From your command prompt/terminal go to your app's root folder and execute:

`cordova plugin add cordova-plugin-signed-bundle`

## Usage
After configuration add `--bundle` and/or `--sign` to the build command to create signed bundles of your application.

```
cordova build android --release --bundle --sign
```
If the `--sign` option is added, you will be asked to enter the password for the keystore during build.

## Configuration
In order to sign the app you need to specify the keystore-file and the alias to use for the signing process in the config.xml file. If you do not have these go to `generate keystore alias first`.
### config.xml
Add the preferences `signed_bundle_keystore_path` (relative or absolute) and `signed_bundle_keystore_alias` inside the `<platform name="android"></platform>` in your config file.

For example:

```
<platform name="android">
    <preference name="signed_bundle_keystore_path" value="../android.keystore" />
    <preference name="signed_bundle_keystore_alias" value="nl.eyeseet.alias" />
</platform>
```

### Generate keystore alias (windows)
If you do not have a keystore and/or alias move to the directory to store the keystore. And execute the following command (replace `<filename>` and `<app_alias>` with own values):

```
keytool -genkey -v -keystore <filename>.keystore -alias <app_alias> -keyalg RSA -keysize 2048 -validity 10000
```
Now use the `path of the keystore file` and `<app_alias>` to configure the config.xml file.