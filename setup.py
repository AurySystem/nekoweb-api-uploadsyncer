
key = input("Auth Key: ")

cache = input("Cache directory: ")

sources = input("Source directory: ")

file = open("TokenAndPaths.txt","wt")

file.write("""{key}
{cache}
{sources}""".format(key=key,cache=cache,sources=sources))
file.close()