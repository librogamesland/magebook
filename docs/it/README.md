# Magebook

Magebook è un editor per *librogame*, cioè testi divisi in paragrafi numerati. A fine di ogni paragrafo ci sono link verso altri paragrafi. Il lettore non deve quindi leggere dall'inizio alla fine del libro, ma saltare da un paragrafo all'altro in base alle proprie scelte.

Esempio:
```markdown
# Titolo libro
author: Nome Autore

### 1
Dove vuoi andare? [A destra 2](#2) o [a sinistra 3](#3)?

### 2
Sei andato a destra.

### 3
Sei andato a sinistra.
```
Magebook ti aiuterà a scrivere il tuo *librogame* con una serie di funzioni pensate apposta per il genere.


# Download
Magebook nasce come [programma web](https://librogamesland.github.io/magebook/editor/) e solo la versione web include le funzionalità online come i libri collaborativi.

Per lavorare sui file locali, scarica Magebook da qui (scegli il tuo sistema operativo):
- [Windows](https://librogamesland.github.io/magebook/dist/magebook-windows.exe)
- [Linux](https://librogamesland.github.io/magebook/dist/magebook-linux)
- [MacOs](https://librogamesland.github.io/magebook/dist/magebook-macos)

*NOTA*: per funzionare, Magebook richiede che sia installato Google Chrome o Microsoft Edge.

# Funzionalità base

I libri di Magebook sono scritti in formato Markdown. È inoltre possibile leggere e scrivere libri in formato LibroGameCreator3, con un'ottima compatibilità.

Ogni libro ha un titolo, alcune proprietà e una serie di paragrafi:

```markdown
# Titolo del libro
author: INSERISCI QUI IL TUO NOME
... altre proprietà ...

### 1
Questo è il primo paragrafo. Di solito si usano i numeri per identificare i paragrafi, ma è si possono usare anche parole, ad esempio:


### Regole
Per creare un link si usa il formato [Testo del link](#paragrafo). Se il testo è assente, Magebook lo inserirà in automatico. Ad esempio [](#Regole) equivale a [Regole](#Regole). Si possono generare anche nomi più brevi per i paragrafi, ad esempio:

### Paragrafo con titolo molto lungo {#3}
In questo caso, scrivere [](#3) equivale a [Paragrafo con titolo molto lungo](#3).

Usando gli asterischi si può inserire anche *testo in corsivo* e doppi asterischi per **testo in grassetto**.
```

La barra in alto consente di caricare, salvare e creare nuovi file, o esportare il libro in formato Word o LibreOffice/OpenOffice. La voce "Libro" nella barra in alto consente di visualizzare un grafo del libro e di rimescolare i paragrafi.

Appena sotto la barra in alto sono visualizzati il nome del paragrafo corrente e cinque pulsanti, per:
- cercare parole nel testo
- annullare/ripristinare le modifiche al testo
- creare un link vuoto o un link al primo paragrafo disponibile.

Il menu laterale consente di creare, modificare, eliminare e navigare con agilità fra i paragrafi e visualizzare i paragrafi che hanno un link al paragrafo attuale.

# Progetti collaborativi

Magebook consente anche di lavorare su progetti condivisi, che possono essere modificati da più dispositivi contemporaneamente, con le modifiche sincronizzate in tempo reale. Grazie a questa funzionalità è possibile collegare a Magebook il proprio account Google attraverso Google Firebase, che è gratuito fino a 1GB di memoria (circa 500 librogame completi).

## Abilita e collega il tuo account Google

La procedura è un po' complicata e richiede qualche minuto, ma una volta completata la prima volta, non sarà più necessario ripeterla per i libri successivi.

Vai su <https://console.firebase.google.com/>, fai il login con google e crea un nuovo progetto. Dai il nome che preferisci (non è importante). Non serve abilitare Google Analytics.

![](img/1.png)
![](img/2.png)


Una volta creato il progetto, cerca nel menu laterale a sinistra "Realtime Database" e quindi premi il tasto "Create Database". Scegli la zona più vicina a te e "Avvia in modalità di blocco".

![](img/3.png)
![](img/4.png)


Nella schermata che si apre, seleziona regole. Rimuovi le regole presenti e sostituiscile con:
```javascript
{
  "rules": {
    "$secret": {
      ".read": true,
      ".write": true 
    }
  }
}
```

Ci siamo quasi. Dal menu laterale a sinistra, clicca su "Panoramica del progetto".

![](img/5.png)


Sotto a "Inizia aggiungendo Firebase alla tua app" c'è un pulsante con il simbolo `</>` (web). Cliccalo. Scegli il nickname che preferisci (non è importante) e clicca su "Registra app".

![](img/6.png)
![](img/7.png)



A questo punto, dovresti vedere una serie di codici di autorizzazione, fra cui `apiKey` e `databaseURL`. Questi sono i valori che vanno copiaincollati all'interno di Magebook. Nell'esempio della figura qui sotto i due valori sono rispettivamente `KazbNyCUNqM661l1eVQ7mqOPAIadWq1YJ7MH3Y` e `https://esempio-libreria1-default-rtdb.europe-west1.firebasedatabase.app`

![](img/8.png)

Apri Magebook, dalla barra di navigazione in alto seleziona `File -> Nuovo Collaborativo`. Inserisci `apiKey` e `databaseURL` e scegli un nome per il libro. Il nome deve essere univoco: è molto importante perché identificherà il tuo libro, fungendo quindi anche da password.

Una volta terminato, verrai portato a una pagina di Magebook con il nuovo libro. Salva l'URL della pagina fra i segnalibri (così da poterlo ritrovare in seguito) e condividilo con chi vuoi.

Fatto!


# Esportazione Word/LibreOffice

Magebook consente di personalizzare come diventerà il tuo libro esportato in Word/LibreOffice, aggiungendo delle opzioni.

**(funzione ancora non disponibile! Work in progress!)**

Ad esempio, è possibile:
```markdown
# Titolo Libro
author: Nome e Cognome
export-heading-style: inline

### 1
... testo paragrafo ...
```


# Trasforma il libro in app

**(funzione ancora non disponibile! Work in progress!)**

I libri che scrivi con Magebook potranno essere usati come base per creare [app ibride](#https://ionic.io/), che possono essere distribute come app web o su Android o Ios.



# Licenza e autori
Magebook è un software gratuito e open-source (licenza MIT) sviluppato da **Luca Fabbian** <luca.fabbian.1999@gmail.com>, con il supporto della community di [Librogame's Land](http://librogame.net).

Il progetto nasce come versione browser di [LibroGameCreator 3](http://www.matteoporopat.com/librogame/libro-game-creator-3/).