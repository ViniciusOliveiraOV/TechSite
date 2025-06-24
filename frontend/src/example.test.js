import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

test('basic test', () => {
  expect(true).toBe(true)
})

test('renders app', () => {
  render(<App />)
  // Teste simples - apenas verifica se renderiza
  expect(document.body).toBeInTheDocument()
})