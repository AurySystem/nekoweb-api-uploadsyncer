import requests
import watchdog
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
from threading import Timer
from filecmp import dircmp
import os.path
import os

url = "https://nekoweb.org/api/"

ChangedFiles = {}
Auth = ""
Cache = ""
Sources = ""

try:
    authfile = open("TokenAndPaths.txt","rt")
    Auth = authfile.readline().rstrip(" \n")
    Cache = str(os.path.normpath(authfile.readline().rstrip(" \n")))
    Sources = str(os.path.normpath(authfile.readline().rstrip(" \n")))
except FileNotFoundError:
    Auth = input("Auth Key: ")
    Cache = input("Cache directory: ")
    Sources = input("Source directory: ")
    save = input("Save Authorization Token and Dirctories? y/n ").lower().strip()
    if("y" in save) or ("exit" in save) or ("true" in save):
        try:
            file = open("TokenAndPaths.txt","wt")
            file.write("""{key}
{cache}
{sources}""".format(key=Auth,cache=Cache,sources=Sources))
            file.close()
        except:
            print("Error writing config file")
    else:
        print("starting")


def buildIntialState(comparison):
    
    for name in comparison.diff_files:
        ChangedFiles[name] = {"new":False,"delete":False,"change":True,"rename":False,"to":""}
    for subdir in comparison.subdirs.values():
        buildIntialState(subdir)
    
    for name in comparison.left_only:
        if(os.path.isdir(os.path.join(comparison.left,name))):
            for directory, subdirs, files in os.walk(os.path.join(comparison.left,name)):
                for file in files:
                    ChangedFiles[str(os.path.join(directory[len(comparison.left):],file))] = {"new":False,"delete":True,"change":False,"rename":False,"to":""}
                    
    for name in comparison.right_only:
        if(os.path.isdir(os.path.join(comparison.right,name))):
            for directory, subdirs, files in os.walk(os.path.join(comparison.right,name)):
                for file in files:
                    ChangedFiles[str(os.path.join(directory[len(comparison.right):],file))] = {"new":True,"delete":False,"change":True,"rename":False,"to":""}

try:
    dirCompare = dircmp(Cache, Sources)
    buildIntialState(dirCompare)
except:
    try:
        for directory, subdirs, files in os.walk(Sources): #more likely for the cache not to exist yet than the sources
            for file in files:
                ChangedFiles[str(os.path.join(directory[len(Sources):],file))] = {"new":True,"delete":False,"change":True,"rename":False,"to":""}
    except Exception as e:
        print(e)
        print("Errors reading sources, assuming sources directory doesn't exist")
        os.makedirs(Sources,exist_ok=True)
print(ChangedFiles)

class ChangeHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        dest = ""
        try:
            dest = event.dest_path
        except:
            pass
        print(event.src_path, event.event_type, dest)


observer = Observer()
observer.schedule(ChangeHandler(), Sources, recursive=True)
observer.start()

try:
    exit = False
    while(not exit):
        text = input("Press y at anytime to exit\n").lower().strip()
        if("y" in text) or ("exit" in text) or ("true" in text):
            exit = True
            observer.stop()
except KeyboardInterrupt:
    observer.stop()
observer.join()
