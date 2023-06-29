# BSM (BrainF**K Assembly)

BMS is a simple assembly language for BrainF**k.

## Primitive Operations
### Move
```text
# >
right
# >>>>> >>>>>
right 10

# <
left
# <<<<< <<<<<
left 10

# Negative values are allowed
# Equivalent to `left 4`
right -4
```

### Cell
```text
# +
inc
# +++++ +++++
inc 10

# -
dec
# ----- -----
dec 10

# Negative values are allowed
# Equivalent to `dec 4`
inc -4
```

### I/O
```text
# .
write

# ,
read
```

### Loop
```text
loop {
    loop {
        dec
        right
    }
}
```

### Breakpoint
```text
# @
# Supported by some interpreters.
debug
```

## Common operations
### Setting
```text
# Equivalent to loop { dec }
set 0

# Equivalent to loop { dec }; inc 42
set '*'

# Equivalent to set 1; right; set 2; right; set 3; left 2;
set [1, 2, 3]
set "Hello, world!\0"

# Assumes that all cells are set to zero.
init "Hello, world!\0"
```
