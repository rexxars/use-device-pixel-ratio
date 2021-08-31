import React from 'react'
import ReactDOM from 'react-dom'
import {useDevicePixelRatio} from '../index'

function Demo() {
  const dpr = useDevicePixelRatio()
  return (
    <div className="currentDpr">
      Device Pixel Ratio: <strong>{dpr}</strong>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Demo />
  </React.StrictMode>,
  document.getElementById('root')
)
