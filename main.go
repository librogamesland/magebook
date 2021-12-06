package main

import (
	"fmt"
	"embed"
	"io/ioutil"
	"net"
	"net/http"
	"log"
	"encoding/json"

	"github.com/sandro/lorca"
	"github.com/inconshreveable/go-update"

)

//go:embed dist
var fs embed.FS


type PackageInfo struct {
  Version string
}


func getVersion() string {
	url := "https://librogamesland.github.io/magebook/package.json"
	response, err := http.Get(url)
	if err != nil {
			log.Fatal(err)
	}
	defer response.Body.Close()

	responseData, err := ioutil.ReadAll(response.Body)
	if err != nil {
			log.Fatal(err)
	}

	responseString := string(responseData)



	var packageInfo PackageInfo	
	json.Unmarshal([]byte(responseString), &packageInfo)
	return packageInfo.Version
}

func doUpdate(url string) error {
	resp, err := http.Get(url)
	if err != nil {
			return err
	}
	defer resp.Body.Close()
	err := update.Apply(resp.Body, update.Options{})
	if err != nil {
			// error handling
	}
	return err
}

func main() {
	ui, err := lorca.New("data:text/html,<title>Magebook web editor</title>", "", 1000, 600)
	if err != nil {
		log.Fatal(err)
	}
	defer ui.Close()


	// Data model: number of ticks
	// Bind Go functions to JS

	ui.Bind("filesAdded", func(listVar string, length int) []string {
		paths := make([]string, length)
		for i := 0; i < length; i++ {
			tm, err := ui.EvalRaw(fmt.Sprintf("window.%s[%d]", listVar, i))
			if err != nil {
				log.Printf("error evaluating window.%s. err: %s\n", listVar, err)
			}
			path, err := lorca.GetFilePath(ui, tm.Result.Result.ObjectID)
			if err != nil {
				log.Println(err)
			} else {
				paths[i] = path
			}
		}
		return paths
	})

	ln, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()
	go http.Serve(ln, http.FileServer(http.FS(fs)))
	ui.Load(fmt.Sprintf("http://%s/dist", ln.Addr()))

	getVersion()


	// Start ticker goroutine
	go func() {

		ui.Eval(fmt.Sprintf(`console.log("maeffds %s")`, getVersion()))
		
	}()
	<-ui.Done()
}