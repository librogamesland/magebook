package main

import (
	"fmt"
	"embed"
	"io/ioutil"
	"os"
	"path/filepath"
	"net"
	"net/http"
	"log"
	"encoding/json"
	"runtime"
  
  "github.com/juju/fslock"
	"github.com/ncruces/zenity"
	"github.com/zserge/lorca"
	"github.com/inconshreveable/go-update"
	"github.com/jpillora/overseer"

)

//go:embed editor
var fs embed.FS


type PackageInfo struct {
  Version string
}




type FileInfo struct{
  Timestamp int64
	Data string 
}


func main() {
	overseer.Run(overseer.Config{
		Program: prog,
	})
}


func prog(overseer.State) {

	homedir, err := os.UserHomeDir()
	if err != nil {
			log.Fatal( err )
	}


	var lock *fslock.Lock  = nil



	db := filepath.Join(homedir, ".magebook")

	err = os.MkdirAll(db, os.ModePerm)
	if err != nil {
		fmt.Println("Error", err)
	}


	ui, err := lorca.New("data:text/html,<title>Magebook web editor</title>", "", 1000, 600)
	if err != nil {
		log.Fatal(err)
	}
	defer ui.Close()


	ui.Bind("saveRecent", func(filename string, data string ) {
		ioutil.WriteFile(filepath.Join(db, filename), []byte(data), 0644)
	})


	ui.Bind("loadRecents", func() string {
		filesMap := make(map[string] FileInfo)

		items, _ := ioutil.ReadDir(db)
		for _, item := range items {
				if !item.IsDir() && item.Size() < 10000 {
					filename := filepath.Join(db, item.Name())
					content, _ := ioutil.ReadFile(filename)

					filesMap[item.Name()] = FileInfo{ Timestamp: item.ModTime().Unix(), Data: string(content)}
				}
		}
		jsonString, _ := json.Marshal(filesMap)

		return string(jsonString)
	})

	ui.Bind("readFile", func(filename string) string {
		if lock != nil {
			lock.Unlock()
		}
		lock = fslock.New(filename)
		lockErr := lock.TryLock()
		if lockErr != nil {
				fmt.Println("falied to acquire lock > " + lockErr.Error())
				// TODO
		}
		content, _ := ioutil.ReadFile(filename)
		return string(content)
	})

	ui.Bind("releaseLock", func() {
		if lock != nil {
			lock.Unlock()
		}
		lock = nil
	})


	ui.Bind("writeFile", func(filename string, data string) {
		ioutil.WriteFile(filename, []byte(data), 0644)
	})


	ui.Bind("dialogFile", func(title string) string {
		filename, _ := zenity.SelectFileSave(
			zenity.Title(title),
			zenity.FileFilters{
				{"Magebook documents", []string{"*.md", "*.xlgc"}},
			})
	
		return filename
	})

	ui.Bind("appGetVersion", func () string {
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
	})

	ui.Bind("appUpdate", func () {
		var url = "https://librogamesland.github.io/magebook/dist/magebook-windows"
		if runtime.GOOS == "linux" {
			url = "https://librogamesland.github.io/magebook/dist/magebook-linux"
		}
		if runtime.GOOS == "darwin" {
			url = "https://librogamesland.github.io/magebook/dist/magebook-macos"
		}
		resp, err := http.Get(url)
		if err != nil {
			return //err
		}
		defer resp.Body.Close()
		err = update.Apply(resp.Body, update.Options{})
		if err != nil {
				// error handling
		}
		overseer.Restart()
	})



	ln, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()
	go http.Serve(ln, http.FileServer(http.FS(fs)))
	ui.Load(fmt.Sprintf("http://%s/editor/index-local.html#app=enabled", ln.Addr()))

//	getVersion()


	// Start ticker goroutine
	go func() {

		//ui.Eval(fmt.Sprintf(`console.log("maeffds %s")`, getVersion()))
		
	}()
	<-ui.Done()

	if lock != nil {
		lock.Unlock()
	}

}