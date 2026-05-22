// After electron-builder packages the app, inject the custom icon
const { rcedit } = require('rcedit')
const path = require('path')
const fs = require('fs')

exports.default = async function (context) {
  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`)
  const iconPath = path.join(__dirname, '..', 'resources', 'icon.ico')

  if (!fs.existsSync(exePath)) {
    console.log('  • exe not found at', exePath)
    return
  }
  if (!fs.existsSync(iconPath)) {
    console.log('  • icon.ico not found at', iconPath)
    return
  }

  try {
    console.log('  • injecting custom icon into', exePath)
    await rcedit(exePath, { icon: iconPath })
    console.log('  • icon injected successfully')
  } catch (e) {
    console.log('  • icon injection failed:', e.message)
  }
}
