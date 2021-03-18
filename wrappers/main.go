package main

import (
	"fmt"
	"log"
	"sync/atomic"
	"time"

	"github.com/zserge/lorca"
)

func main() {
	ui, err := lorca.New("data:text/html,<title>Lgcjs - Gamebook web editor</title>", "", 800, 550)
	if err != nil {
		log.Fatal(err)
	}
	defer ui.Close()

	// Data model: number of ticks
	ticks := uint32(0)
	// Channel to connect UI events with the background ticking goroutine
	togglec := make(chan bool)
	// Bind Go functions to JS
	ui.Bind("toggle", func() { togglec <- true })
	ui.Bind("reset", func() {
		atomic.StoreUint32(&ticks, 0)
		ui.Eval(`document.querySelector('.timer').innerText = '0'`)
	})

	// Load HTML after Go functions are bound to JS
	ui.Load("https://librogamesland.github.io/lgcjs/release")

	// Start ticker goroutine
	go func() {
		t := time.NewTicker(100 * time.Millisecond)
		for {
			select {
			case <-t.C: // Every 100ms increate number of ticks and update UI
				ui.Eval(fmt.Sprintf(`document.querySelector('.timer').innerText = 0.1*%d`,
					atomic.AddUint32(&ticks, 1)))
			case <-togglec: // If paused - wait for another toggle event to unpause
				<-togglec
			}
		}
	}()
	<-ui.Done()
}